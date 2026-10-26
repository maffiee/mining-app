import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuditLogService } from '../../core/services/audit-log.service';
import type { MaterialIntake } from './material-intake.model';

type LegacyMaterialIntake = MaterialIntake & {
  tonnage?: number;
  costPerTon?: number;
  totalCost?: number;
  supplierName?: string;
  date?: string;
};

@Injectable({ providedIn: 'root' })
export class MaterialIntakeService {
  private readonly firestore = inject(Firestore);
  private readonly audit = inject(AuditLogService);

  private col = collection(this.firestore, 'materialIntakes');

  getAll(): Observable<MaterialIntake[]> {
    const q = query(this.col, orderBy('createdAt', 'desc'));

    return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
      map((items) => items.map((item) => ({
        id: item.id ?? '',
        customerId: item.customerId ?? '',
        customerName: item.customerName ?? item.supplierName ?? 'Unknown customer',
        materialType: item.materialType ?? '',
        quantity: Number(item.quantity ?? item.tonnage ?? 0),
        unit: item.unit ?? 'kg',
        date: item.date ?? item.intakeDate ?? new Date().toISOString().split('T')[0],
        notes: item.notes ?? '',
        status: item.status ?? 'pending',
        createdAt: item.createdAt,
      })))
    );
  }

  getMaterialIntakes(): Observable<MaterialIntake[]> {
    return this.getAll();
  }

  async create(data: LegacyMaterialIntake) {
    const tonnage = data.tonnage ?? 0;
    const costPerTon = data.costPerTon ?? 0;
    const payload = { ...data, totalCost: tonnage * costPerTon, createdAt: serverTimestamp() };
    const ref = await addDoc(this.col, payload);
    
    await this.audit.log({
      action: 'CREATE',
      collection: 'materialIntakes',
      recordId: ref.id,
      description: `Added intake ${tonnage}T ${data.materialType} @ ₦${costPerTon}/T = ₦${payload.totalCost}`,
    });
  }

  async createMaterialIntake(data: Omit<MaterialIntake, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(this.col, { ...data, createdAt: serverTimestamp() });
    await this.audit.log({
      action: 'CREATE',
      collection: 'materialIntakes',
      recordId: ref.id,
      description: `Received ${data.quantity} ${data.unit} ${data.materialType} from ${data.customerName}`,
    });
    return ref.id;
  }

  async update(id: string, data: Partial<LegacyMaterialIntake>) {
    const docRef = doc(this.firestore, 'materialIntakes', id);
    const oldSnap = await getDoc(docRef);
    const oldData = oldSnap.exists() ? oldSnap.data() as any : null;

    const updatePayload: any = { ...data };
    if (data.tonnage || data.costPerTon) {
      const ton = data.tonnage ?? oldData?.tonnage ?? 0;
      const cost = data.costPerTon ?? oldData?.costPerTon ?? 0;
      updatePayload.totalCost = ton * cost;
    }
    updatePayload.updatedAt = serverTimestamp();

    await updateDoc(docRef, updatePayload);

    await this.audit.log({
      action: 'UPDATE',
      collection: 'materialIntakes',
      recordId: id,
      description: `Updated intake ${oldData?.materialType} from ${oldData?.tonnage ?? oldData?.quantity}T to ${data.tonnage ?? oldData?.tonnage ?? oldData?.quantity}T`,
      before: oldData,
      after: data,
    });
  }

  async updateMaterialIntake(id: string, data: Partial<MaterialIntake>) {
    return this.update(id, data);
  }

  async markAsCompleted(id: string) {
    const docRef = doc(this.firestore, 'materialIntakes', id);
    await updateDoc(docRef, {
      status: 'completed',
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string) {
    const docRef = doc(this.firestore, 'materialIntakes', id);
    const oldSnap = await getDoc(docRef);
    const oldData = oldSnap.exists() ? oldSnap.data() as any : null;

    await deleteDoc(docRef);

    await this.audit.log({
      action: 'DELETE',
      collection: 'materialIntakes',
      recordId: id,
      description: `Deleted intake ${oldData?.tonnage}T ${oldData?.materialType} ₦${oldData?.totalCost}`,
      before: oldData,
    });
  }
}