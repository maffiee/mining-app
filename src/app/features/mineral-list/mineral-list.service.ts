import { Injectable, inject } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from '@angular/fire/firestore';
import { AuditLogService } from 'src/app/core/services/audit-log.service';
import { AuthService } from 'src/app/core/services/auth.service';

export interface Minerals {
  id?: string;
  name: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

@Injectable({ providedIn: 'root' })
export class MineralListService {
  private readonly firestore = inject(Firestore);
  private COL_PATH = 'minerals';
  private readonly authService = inject(AuthService);
  private readonly auditLogService = inject(AuditLogService);

  private col() { return collection(this.firestore, this.COL_PATH); }

  private get currentUser(): string {
    const user: any = this.authService.user();
    if (!user) return 'system';
    if (typeof user === 'string') return user;
    return user.email || user.uid || 'system';
  }

  async createMinerals(data: { name: string; isActive?: boolean }): Promise<string> {
    const name = data.name.trim();
    if (!name) throw new Error('Mineral name is required');
    if (name.length < 2) throw new Error('Name too short');

    const q = query(this.col(), where('name', '==', name));
    const exist = await getDocs(q);
    if (!exist.empty) throw new Error(`Mineral "${name}" already exists`);

    const ref = await addDoc(this.col(), {
      name,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp(),
      createdBy: this.currentUser,
      updatedAt: serverTimestamp(),
    });

    await this.auditLogService.log({
      action: 'CREATE',
      collection: this.COL_PATH,
      recordId: ref.id,
      description: `Created mineral ${name}`
    });
    return ref.id;
  }

  async getAll(): Promise<Minerals[]> {
    const q = query(this.col(), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Minerals));
  }

  async updateMineral(id: string, data: Partial<Minerals>): Promise<void> {
    const ref = doc(this.firestore, `${this.COL_PATH}/${id}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Mineral not found');
    const payload: any = { updatedAt: serverTimestamp() };
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) throw new Error('Name cannot be empty');
      const q = query(this.col(), where('name', '==', name), limit(1));
      const exists = await getDocs(q);
      if (exists.docs.some(d => d.id !== id)) throw new Error(`Mineral "${name}" already exists`);
      payload.name = name;
    }
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    await updateDoc(ref, payload);
    await this.auditLogService.log({ action: 'UPDATE', collection: this.COL_PATH, recordId: id, description: `Updated mineral ${id}` });
  }

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    return this.updateMineral(id, { isActive });
  }

  async deleteMineral(id: string): Promise<void> {
    const ref = doc(this.firestore, `${this.COL_PATH}/${id}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Mineral not found');
    await deleteDoc(ref);
    await this.auditLogService.log({ action: 'DELETE', collection: this.COL_PATH, recordId: id, description: `Deleted mineral ${id}` });
  }
}