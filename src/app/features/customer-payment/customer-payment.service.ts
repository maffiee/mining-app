import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface CustomerPayment {
  id: string;

  settlementId: string;
  customerId: string;
  customerName: string;

  settlementAmount: number;
  amountPaid: number;
  balance: number;

  paymentMethod: 'cash' | 'transfer' | 'pos';

  paymentDate: string;
  reference?: string;
  notes?: string;

  status: 'pending' | 'partially-paid' | 'paid';

  createdAt?: any;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerPaymentService {
  private readonly firestore = inject(Firestore);

  private readonly paymentCollection = collection(
    this.firestore,
    'customerPayments'
  );
  private readonly expenseCol = collection(this.firestore, 'companyExpenses');

  getAll(): Observable<CustomerPayment[]> {
    return collectionData(this.paymentCollection, {
      idField: 'id',
    }) as Observable<CustomerPayment[]>;
  }

  async create(
    payment: Omit<CustomerPayment, 'id' | 'createdAt'>
  ): Promise<string> {
    const payRef = await addDoc(this.paymentCollection, {
      ...payment,
      createdAt: serverTimestamp(),
    });

      // Auto-create expense
  await addDoc(this.expenseCol, {
    category: 'customer_payment',
    amount: payment.amountPaid,
    description: `Payment to ${payment.customerName} - ${payment.settlementId}`,
    expenseDate: payment.paymentDate,
    relatedPaymentId: payRef.id,
    createdAt: serverTimestamp(),
  });

    return payRef.id;
  }

  async updatePayment(
  id: string,
  amountPaid: number,
  balance: number,
  status: 'pending' | 'partially-paid' | 'paid'
): Promise<void> {
  const settlementRef = doc(
    this.firestore,
    'customerSettlements',
    id
  );

  await updateDoc(settlementRef, {
    amountPaid,
    balance,
    status,
  });
}
}