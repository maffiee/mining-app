import { Injectable, inject } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from '@angular/fire/firestore';

export interface LocationModel {
  id?: string;
  name: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private firestore = inject(Firestore);
  private COL = 'locations';
  private col() { return collection(this.firestore, this.COL); }

  async getAll(): Promise<LocationModel[]> {
    const q = query(this.col(), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LocationModel));
  }

  async create(name: string): Promise<string> {
    const clean = name.trim();
    if (!clean) throw new Error('Location name required');
    const q = query(this.col(), where('name', '==', clean));
    const exist = await getDocs(q);
    if (!exist.empty) throw new Error(`Location "${clean}" already exists`);
    const ref = await addDoc(this.col(), { name: clean, isActive: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return ref.id;
  }

  async update(id: string, data: { name: string; isActive?: boolean }): Promise<void> {
    const ref = doc(this.firestore, `${this.COL}/${id}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Location not found');
    const clean = data.name.trim();
    const q = query(this.col(), where('name', '==', clean));
    const exist = await getDocs(q);
    if (exist.docs.some(d => d.id !== id)) throw new Error(`Location "${clean}" already exists`);
    await updateDoc(ref, { name: clean, isActive: data.isActive ?? true, updatedAt: serverTimestamp() });
  }

  async toggleActive(id: string, isActive: boolean) {
    const ref = doc(this.firestore, `${this.COL}/${id}`);
    await updateDoc(ref, { isActive, updatedAt: serverTimestamp() });
  }

  async delete(id: string) {
    const ref = doc(this.firestore, `${this.COL}/${id}`);
    await deleteDoc(ref);
  }
}