import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, serverTimestamp, getDocs, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StaffPaymentService {
  private readonly firestore = inject(Firestore);
  private readonly col = collection(this.firestore, 'staffPayments');
  private readonly expenseCol = collection(this.firestore, 'companyExpenses');

  getAll(): Observable<any[]> {
    return collectionData(this.col, { idField: 'id' }) as any;
  }

  // async create(payment: any): Promise<void> {
  //   const ref = await addDoc(this.col, {...payment, createdAt: serverTimestamp() });

  //   // AUTO expense -> labor
  //   await addDoc(this.expenseCol, {
  //     category: 'labor',
  //     amount: payment.amount,
  //     description: `${payment.paymentType} - ${payment.staffName} (${payment.role}) - ${payment.paymentMonth || ''}`,
  //     expenseDate: payment.paymentDate,
  //     relatedStaffPaymentId: ref.id,
  //     staffId: payment.staffId,
  //     createdAt: serverTimestamp(),
  //   });
  // }


async isPaid(staffId: string, month: string): Promise<boolean> {
  const q = query(this.col, where('staffId','==', staffId), where('paymentMonth','==', month));
  const snap = await getDocs(q);
  return!snap.empty;
}

async create(payment: any): Promise<void> {
  // PREVENT DOUBLE PAY
  if (await this.isPaid(payment.staffId, payment.paymentMonth)) {
    throw new Error(`${payment.staffName} already paid for ${payment.paymentMonth}`);
  }

  const ref = await addDoc(this.col, {...payment, createdAt: serverTimestamp() });
  await addDoc(this.expenseCol, {
    category: 'labor',
    amount: payment.amount,
    description: `${payment.paymentType} - ${payment.staffName} (${payment.role}) - ${payment.paymentMonth}`,
    expenseDate: payment.paymentDate,
    relatedStaffPaymentId: ref.id,
    staffId: payment.staffId,
    createdAt: serverTimestamp(),
  });
}

}