import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MineralInventoryService } from '../mineral-inventory/mineral-inventory.service';

export type MineralType = 'monazite' | 'zircon' | 'iron';

export interface MineralSale {
  id?: string;
  buyerName: string;
  buyerLocation: string;
  mineralType: MineralType;
  quantity: number;
  unitPrice: number;
  totalAmount: number; // qty * unitPrice
  transportationCost: number;
  netAmount: number; // totalAmount - transportationCost
  saleDate: string;
  notes?: string;
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class MineralSaleService {
  private readonly firestore = inject(Firestore);
  private readonly inventoryService = inject(MineralInventoryService);
  private readonly col = collection(this.firestore, 'mineralSales');
  private readonly revenueCol = collection(this.firestore, 'companyRevenue');
  private readonly expenseCol = collection(this.firestore, 'companyExpense');

  getAll(): Observable<MineralSale[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<MineralSale[]>;
  }

  async create(sale: Omit<MineralSale, 'id'>): Promise<void> {
    // 1. Deduct from inventory first - will throw if insufficient
    await this.inventoryService.deduct(sale.mineralType, sale.quantity);

    // 2. Create sale record
    const saleRef = await addDoc(this.col, {
      ...sale,
      createdAt: serverTimestamp(),
    });


    // 3. Auto-create REVENUE
    await addDoc(this.revenueCol, {
      source: 'mineral_sale',
      sourceId: saleRef.id,
      buyerName: sale.buyerName,
      buyerLocation: sale.buyerLocation,
      mineralType: sale.mineralType,
      quantity: sale.quantity,
      totalAmount: sale.totalAmount,
      revenueDate: sale.saleDate,
      createdAt: serverTimestamp(),
    });

    // 4. Auto-create EXPENSE for transport if > 0
    if (sale.transportationCost > 0) {
      await addDoc(this.expenseCol, {
        category: 'transport',
        amount: sale.transportationCost,
        description: `Transport to ${sale.buyerLocation} for ${sale.buyerName} - ${sale.quantity}kg ${sale.mineralType}`,
        expenseDate: sale.saleDate,
        relatedSaleId: saleRef.id,
        createdAt: serverTimestamp(),
      });
    }

    // 3. Later: auto-create revenue + expense (when those modules ready)
    // revenueService.create({ amount: sale.totalAmount, source: 'mineral_sale' })
    // expenseService.create({ amount: sale.transportationCost, category: 'transport' })
  }
}