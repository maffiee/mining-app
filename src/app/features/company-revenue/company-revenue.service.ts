import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, serverTimestamp, deleteDoc, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CompanyRevenue {
  id?: string;
  source: 'mineral_sale' | 'other';
  sourceId?: string;
  buyerName: string;
  buyerLocation?: string;
  mineralType?: string;
  quantity?: number;
  totalAmount: number;
  revenueDate: string;
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class CompanyRevenueService {
  private readonly firestore = inject(Firestore);
  private readonly col = collection(this.firestore, 'companyRevenue');
  private readonly salesCol = collection(this.firestore, 'mineralSales');

  getAll(): Observable<CompanyRevenue[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<CompanyRevenue[]>;
  }

  getTotal(): Observable<number> {
    return this.getAll().pipe(
      map(revs => revs.reduce((sum, r) => sum + Number(r.totalAmount||0), 0))
    );
  }

  // ONE-TIME FIX
  async recalculateAll(): Promise<void> {
    const salesSnap = await getDocs(this.salesCol);
    const revenueSnap = await getDocs(this.col);

    // 1. Delete old revenue
    for (const d of revenueSnap.docs) {
      await deleteDoc(doc(this.firestore, 'companyRevenue', d.id));
    }

    // 2. Recreate from all sales
    for (const s of salesSnap.docs) {
      const sale: any = s.data();
      await addDoc(this.col, {
        source: 'mineral_sale',
        sourceId: s.id,
        buyerName: sale.buyerName,
        buyerLocation: sale.buyerLocation,
        mineralType: sale.mineralType,
        quantity: sale.quantity,
        totalAmount: sale.totalAmount,
        revenueDate: sale.saleDate,
        createdAt: serverTimestamp(),
      });
    }
  }

}