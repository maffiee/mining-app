import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDocs, query, where, setDoc, serverTimestamp, increment, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Buyer {
  id?: string;
  name: string;
  location: string;
  phone: string; // WhatsApp number e.g. 2348012345678
  totalBoughtKg: number;
  totalBoughtNaira: number;
  totalPaid: number;
  balance: number; // negative = owes you, positive = you owe refund
  lastSaleDate?: string;
  createdAt?: any;
}

export interface BuyerLedger {
  id?: string;
  buyerId: string;
  buyerName: string;
  type: 'SALE' | 'PAYMENT' | 'DEBT';
  saleId?: string;
  amount: number; // total sale amount
  paid: number;   // amount paid now
  debt: number;   // amount - paid
  balanceAfter: number; // buyer total balance after this
  saleDetails?: string; // e.g. 100kg monazite
  createdAt?: any;
  createdBy?: string;
}

@Injectable({ providedIn: 'root' })
export class BuyerService {
  private readonly firestore = inject(Firestore);
  private readonly buyerCol = collection(this.firestore, 'buyers');
  private readonly ledgerCol = collection(this.firestore, 'buyerLedgers');

  getAll(): Observable<Buyer[]> {
    return collectionData(this.buyerCol, { idField: 'id' }) as Observable<Buyer[]>;
  }

  getLedger(buyerId: string): Observable<BuyerLedger[]> {
    const q = query(this.ledgerCol, where('buyerId', '==', buyerId), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<BuyerLedger[]>;
  }

  getAllLedgers(): Observable<BuyerLedger[]> {
    const q = query(this.ledgerCol, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<BuyerLedger[]>;
  }

  async findOrCreateBuyer(name: string, location: string, phone: string): Promise<string> {
    const q = query(this.buyerCol, where('name', '==', name));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].id;

    const ref = doc(this.buyerCol);
    await setDoc(ref, {
      name, location, phone,
      totalBoughtKg: 0,
      totalBoughtNaira: 0,
      totalPaid: 0,
      balance: 0,
      createdAt: serverTimestamp()
    });
    return ref.id;
  }

  async updateBalance(buyerId: string, saleAmount: number, paid: number, kg: number) {
    const ref = doc(this.firestore, 'buyers', buyerId);
    const debt = saleAmount - paid;
    await setDoc(ref, {
      totalBoughtKg: increment(kg),
      totalBoughtNaira: increment(saleAmount),
      totalPaid: increment(paid),
      balance: increment(debt), // balance = total debt owed to you
      lastSaleDate: new Date().toISOString().split('T')[0],
      updatedAt: serverTimestamp()
    }, { merge: true });
    return debt;
  }

  async addLedger(entry: Omit<BuyerLedger, 'id'|'createdAt'>) {
    const ref = doc(this.ledgerCol);
    await setDoc(ref, { ...entry, createdAt: serverTimestamp() });
  }

  // Total debt owed by all buyers - for auditing
  async getTotalDebt(): Promise<number> {
    const snap = await getDocs(this.buyerCol);
    let total = 0;
    snap.forEach(d => {
      const data = d.data() as Buyer;
      if (data.balance > 0) total += data.balance;
    });
    return total;
  }
}