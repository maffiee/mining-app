import { Injectable, inject } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from '@angular/fire/firestore';

export interface MineralPricing {
  id?: string;
  mineralId: string;
  mineralName: string;
  locationId: string;
  locationName: string;
  lowPrice: number;
  mediumPrice: number;
  highPrice: number;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class MineralPricingService {
  private firestore = inject(Firestore);
  private COL = 'mineral_pricing';
  private col() { return collection(this.firestore, this.COL); }

  async getAll(): Promise<MineralPricing[]> {
    const q = query(this.col(), orderBy('createdAt','desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MineralPricing));
  }

  async create(data: Omit<MineralPricing,'id'|'createdAt'|'updatedAt'>): Promise<string> {
    const q = query(this.col(), where('mineralId','==',data.mineralId), where('locationId','==',data.locationId));
    const exist = await getDocs(q);
    if(!exist.empty) throw new Error(`${data.mineralName} already has price for ${data.locationName}`);
    const ref = await addDoc(this.col(), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return ref.id;
  }

  async update(id: string, data: Partial<MineralPricing>): Promise<void> {
    const ref = doc(this.firestore, `${this.COL}/${id}`);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  }

  async delete(id: string) {
    const ref = doc(this.firestore, `${this.COL}/${id}`);
    await deleteDoc(ref);
  }

  async getPrice(mineralId: string, locationId: string, grade: 'low'|'medium'|'high'): Promise<number> {
    const q = query(this.col(), where('mineralId','==',mineralId), where('locationId','==',locationId));
    const snap = await getDocs(q);
    if(snap.empty) throw new Error('No price configured');
    const data = snap.docs[0].data() as MineralPricing;
    if(grade==='low') return data.lowPrice;
    if(grade==='high') return data.highPrice;
    return data.mediumPrice;
  }
}