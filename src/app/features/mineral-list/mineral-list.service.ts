import { Injectable, inject } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuditLogService } from 'src/app/core/services/audit-log.service';
import { AuthService } from 'src/app/core/services/auth.service';

export interface Minerals {
  id?: string;
  name: string;
  price: number;
  createdAt?: any;
  updatedAt?: any;      // <-- add this
  createdBy?: string;
}

@Injectable({ providedIn: 'root' })

export class MineralListService {
  private readonly firestore = inject(Firestore);
  private COL_PATH = 'minerals';
  private readonly col = collection(this.firestore, this.COL_PATH);
  private readonly authService = inject(AuthService);
  private readonly auditLogService = inject (AuditLogService);

  private get currentUser(): string {
  const user: any = this.authService.user();
  if (!user) return 'system';
  if (typeof user === 'string') return user;
  return user.email || user.uid || 'system';
}

  async createMinerals(data: Omit<Minerals, 'id' | 'createdAt' | 'createdBy' | 'updatedAt'>): Promise<string> {
    //clean
    const name = data.name.trim();
    const price = data.price;

    // validate
    if (!name) throw new Error ('Mineral name is required');
    if (name.length < 2)  throw  new Error ('Name too short');
    if (price == null || isNaN(price as any)) throw new Error ('Price is required');
    if (price < 0) throw new Error ('Price can not be negative');

    // check for duplicate
    const q = query(this.col, where( 'name', '==', name));
    const exist = await getDocs(q);
    if (!exist.empty) throw new Error (`Mineral "${name}" already exists`);

    // save

    const ref = await addDoc (this.col, {
      name,
      price,
      createdAt: serverTimestamp(),
      createdBy: this.currentUser,
      updatedAt: serverTimestamp(),
      
    }
    );

    // audit
    await this.auditLogService.log({
      action: 'CREATE',
      collection: this.COL_PATH,
      recordId: ref.id,
      description: `Created mineral of ${name} for ₦${price}`
    });

    return ref.id;
 
     
  }

  async getAll(): Promise<Minerals[]> {
  const q = query(this.col, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Minerals));
}

  async updateMineral(id: string, data: Partial<Minerals>): Promise<void> {
  const ref = doc(this.firestore, `${this.COL_PATH}/${id}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Mineral not found');

  const payload: any = { 
    updatedAt: serverTimestamp() 
  };

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw new Error('Name cannot be empty');
    if (name.length < 2) throw new Error('Name too short');
    
    // check duplicate, but allow same doc to keep its own name
    const q = query(this.col, where('name', '==', name), limit(1));
    const exists = await getDocs(q);
    if (exists.docs.some(d => d.id !== id)) {
      throw new Error(`Mineral "${name}" already exists`);
    }
    payload.name = name;
  }

  if (data.price !== undefined) {
    if (data.price < 0) throw new Error('Price cannot be negative');
    payload.price = data.price;
  }

  
  await updateDoc(ref, payload);

  await this.auditLogService.log({
    action: 'UPDATE',
    collection: this.COL_PATH,
    recordId: id,
    description: `Updated mineral ${id}`,
  });
}

async deleteMineral(id: string): Promise<void> {
  const ref = doc(this.firestore, `${this.COL_PATH}/${id}`);

  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Mineral not found');

  await deleteDoc(ref);

  await this.auditLogService.log({
    action: 'DELETE',
    collection: this.COL_PATH,
    recordId: id,
    description: `Deleted mineral ${id}`,
  });
}

  

}
