import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type StaffRole = 'manager' | 'processor' | 'security' | 'driver' | 'accountant' | 'other';
export type SalaryType = 'monthly';

export interface Staff {
  id?: string;
  fullName: string;
  phone?: string;
  role: StaffRole;
  salaryType: SalaryType;
  salaryAmount: number;
  employmentDate: string;
  status: 'active' | 'inactive';
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly firestore = inject(Firestore);
  private readonly col = collection(this.firestore, 'staff');

  getAll(): Observable<Staff[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<Staff[]>;
  }

  async create(staff: Omit<Staff, 'id'>): Promise<void> {
    await addDoc(this.col, {...staff, createdAt: serverTimestamp() });
  }

  async update(id: string, data: Partial<Staff>): Promise<void> {
    await updateDoc(doc(this.firestore, 'staff', id), data as any);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'staff', id));
  }
}