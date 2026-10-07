import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ExpenseCategory = 'transport' | 'customer_payment' | 'diesel' | 'labor' | 'other';

export interface CompanyExpense {
  id?: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  expenseDate: string;
  relatedSaleId?: string;
  relatedPaymentId?: string;
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class CompanyExpenseService {
  private readonly firestore = inject(Firestore);
  private readonly col = collection(this.firestore, 'companyExpenses');
  private readonly salesCol = collection(this.firestore, 'mineralSales');
  private readonly paymentsCol = collection(this.firestore, 'customerPayments'); // check your name is customerPayments

  getAll(): Observable<CompanyExpense[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<CompanyExpense[]>;
  }

  getTotal(): Observable<number> {
    return this.getAll().pipe(
      map(exs => exs.reduce((sum, r) => sum + Number(r.amount||0), 0))
    );
  }

  // ONE-TIME FIX - backfill both transport + customer payments
  async recalculateAll(): Promise<void> {
    const salesSnap = await getDocs(this.salesCol);
    const paySnap = await getDocs(this.paymentsCol);
    const expenseSnap = await getDocs(this.col);

    // 1. Delete all old expenses
    for (const d of expenseSnap.docs) {
      await deleteDoc(doc(this.firestore, 'companyExpenses', d.id));
    }

    // 2. Recreate transport from sales
    for (const s of salesSnap.docs) {
      const sale: any = s.data();
      if (Number(sale.transportationCost) > 0) {
        await addDoc(this.col, {
          category: 'transport',
          amount: sale.transportationCost,
          description: `Transport to ${sale.buyerLocation} for ${sale.buyerName} - ${sale.quantity}kg ${sale.mineralType}`,
          expenseDate: sale.saleDate,
          relatedSaleId: s.id,
          createdAt: serverTimestamp(),
        });
      }
    }

    // 3. Recreate customer payments as expenses
    for (const p of paySnap.docs) {
      const pay: any = p.data();
      await addDoc(this.col, {
        category: 'customer_payment',
        amount: pay.amountPaid || pay.amount || 0,
        description: `Payment to ${pay.customerName || 'customer'} - Settlement ${pay.settlementId || ''}`,
        expenseDate: pay.paymentDate || pay.createdAt || new Date().toISOString(),
        relatedPaymentId: p.id,
        createdAt: serverTimestamp(),
      });
    }
  }

  async create(expense: Omit<CompanyExpense, 'id'>): Promise<void> {
  await addDoc(this.col, {
   ...expense,
    createdAt: serverTimestamp(),
  });
}
}