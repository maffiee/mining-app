import { Injectable, inject } from '@angular/core';
import {Firestore,addDoc, collection, collectionData, doc, serverTimestamp, updateDoc,} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CustomerSettlement } from './customer-settlement.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerSettlementService {

  private readonly firestore = inject(Firestore);
  private readonly settlementCollection =
    collection(this.firestore, 'customerSettlements');

  getAll(): Observable<CustomerSettlement[]> {
    return collectionData(
      this.settlementCollection,
      { idField: 'id' }
    ) as Observable<CustomerSettlement[]>;
  }


  async create(
    settlement: Omit<
      CustomerSettlement,
      'id' | 'createdAt'
    >
  ): Promise<string> {

    const docRef = await addDoc(
      this.settlementCollection,
      {
        ...settlement,
        createdAt: serverTimestamp(),
      }
    );

    return docRef.id;
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