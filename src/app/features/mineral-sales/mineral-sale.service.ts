import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, serverTimestamp, updateDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MineralInventoryService } from '../mineral-inventory/mineral-inventory.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { BuyerService } from '../../core/services/buyer.service';
import { WhatsappService } from '../../core/services/whatsapp.service';

export type MineralType = 'monazite' | 'zircon' | 'iron';

export interface MineralSale {
  id?: string;
  buyerName: string;
  buyerLocation: string;
  buyerPhone?: string;
  mineralType: MineralType;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount?: number;
  debt?: number;
  saleDate: string;
  notes?: string;
  createdAt?: any;
  createdBy?: string;
}

@Injectable({ providedIn: 'root' })
export class MineralSaleService {
  private readonly firestore = inject(Firestore);
  private readonly inventoryService = inject(MineralInventoryService);
  private readonly auditLogService = inject(AuditLogService);
  private readonly col = collection(this.firestore, 'mineralSales');
  private readonly revenueCol = collection(this.firestore, 'companyRevenues');
  private readonly buyerService = inject(BuyerService);
  private readonly whatsappService = inject(WhatsappService);
  private readonly authService = inject(AuthService);

  getAll(): Observable<MineralSale[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<MineralSale[]>;
  }

  async create(sale: Omit<MineralSale, 'id' | 'createdAt'> & { paidAmount?: number, buyerPhone?: string }): Promise<string> {
    // 1. Deduct stock
    await this.inventoryService.deduct(sale.mineralType, sale.quantity);

    const paid = (sale as any).paidAmount ?? sale.totalAmount;
    const debt = sale.totalAmount - paid;

    const saleRef = await addDoc(this.col, {
      ...sale,
      paidAmount: paid,
      debt,
      createdAt: serverTimestamp(),
      createdBy: this.authService.user()?.email || 'system'
    });

    // 2. Buyer Ledger
    try {
      const buyerId = await this.buyerService.findOrCreateBuyer(sale.buyerName, sale.buyerLocation, (sale as any).buyerPhone || '');
      await this.buyerService.updateBalance(buyerId, sale.totalAmount, paid, sale.quantity);
      
      const buyerSnap = await getDoc(doc(this.firestore, 'buyers', buyerId));
      const balanceAfter = (buyerSnap.data() as any)?.balance || 0;

      await this.buyerService.addLedger({
        buyerId,
        buyerName: sale.buyerName,
        type: debt > 0 ? 'DEBT' : 'SALE',
        saleId: saleRef.id,
        amount: sale.totalAmount,
        paid,
        debt,
        balanceAfter,
        saleDetails: `${sale.quantity}kg ${sale.mineralType}`,
        createdBy: this.authService.user()?.email || 'system'
      });
    } catch (e) {
      console.error('Buyer ledger failed', e);
    }

    // 3. Audit
    await this.auditLogService.log({
      action: 'CREATE',
      collection: 'mineralSales',
      recordId: saleRef.id,
      description: `Sold ${sale.quantity}kg ${sale.mineralType} for ₦${sale.totalAmount} to ${sale.buyerName} - Paid ₦${paid}, Debt ₦${debt}`
    });

    // 4. Revenue - only count paid
    await addDoc(this.revenueCol, {
      source: 'mineral_sale',
      sourceId: saleRef.id,
      buyerName: sale.buyerName,
      buyerLocation: sale.buyerLocation,
      mineralType: sale.mineralType,
      quantity: sale.quantity,
      totalAmount: paid,
      revenueDate: sale.saleDate,
      createdAt: serverTimestamp(),
    });

    // 5. WhatsApp - Buyer + Owner (07062233259) - ONLY HERE, NOT IN FORM
    try {
      const buyerPhone = (sale as any).buyerPhone;
      if (buyerPhone) {
        await this.whatsappService.sendToBuyerAndOwner(
          { ...sale, id: saleRef.id },
          buyerPhone,
          this.authService.user()?.email || 'Staff',
          debt
        );
      }
    } catch (e) { console.error('WhatsApp failed', e); }

    return saleRef.id;
  }

  async update(id: string, sale: Partial<MineralSale>): Promise<void> {
    const saleRef = doc(this.firestore, 'mineralSales', id);
    const oldSnap = await getDoc(saleRef);
    
    if (!oldSnap.exists()) throw new Error('Sale not found');
    const oldData = oldSnap.data() as MineralSale;

    if (sale.quantity && sale.quantity !== oldData.quantity) {
      await this.inventoryService.adjust(
        sale.mineralType || oldData.mineralType,
        oldData.quantity,
        sale.quantity
      );
    }

    await updateDoc(saleRef, {
      ...sale,
      updatedAt: serverTimestamp(),
    });

    await this.auditLogService.log({
      action: 'UPDATE',
      collection: 'mineralSales',
      recordId: id,
      description: `Updated sale ${oldData.buyerName}: ${oldData.quantity}kg -> ${sale.quantity}kg`,
    });
  }
}