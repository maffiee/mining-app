import { Injectable, inject } from "@angular/core";
import { Firestore, addDoc, doc, updateDoc, collection, collectionData, serverTimestamp } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Customer } from "./customer.model";

@Injectable({
  providedIn: 'root',
})

export class CustomerService{
  private readonly firebase = inject(Firestore);
  private readonly customerCollection = collection(this.firebase, 'customers')

  getCustomers(): Observable<Customer[]> {
    return collectionData( this.customerCollection, { idField: 'id' }) as Observable<Customer[]>;
  }

  // async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<any> {
  //   const docRef = await addDoc(this.customerCollection,{...customer, createdAt: serverTimestamp(),});
  //   return docRef.id;
  // }

  async createCustomer(
  customer: Omit<Customer, 'id' | 'createdAt'>
): Promise<string> {

  console.log('1. Starting Firestore write');

  const docRef = await addDoc(
    this.customerCollection,
    {
      ...customer,
      createdAt: serverTimestamp(),
    }
  );

  console.log('2. Firestore write completed:', docRef.id);

  return docRef.id;
}

async updateCustomer(id: string, customer: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<void> {
  const customerRef = doc(this.firebase, 'customers', id);
  await updateDoc(customerRef, {
    ...customer,
  });
}
}
