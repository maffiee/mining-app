import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, doc, updateDoc, collection, collectionData, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MaterialIntake } from './material-intake.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialIntakeService {
  private readonly firebase = inject(Firestore);
  private readonly materialIntakeCollection = collection(this.firebase, 'material-intake');

  getMaterialIntakes(): Observable<MaterialIntake[]> {
    return collectionData(this.materialIntakeCollection, { idField: 'id' }) as Observable<MaterialIntake[]>;
  }

  async createMaterialIntake(materialIntake: Omit<MaterialIntake, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(this.materialIntakeCollection, {
      ...materialIntake,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateMaterialIntake(id: string, materialIntake: Partial<Omit<MaterialIntake, 'id' | 'createdAt'>>): Promise<void> {
    const materialIntakeRef = doc(this.firebase, 'material-intake', id);
    await updateDoc(materialIntakeRef, {
      ...materialIntake,
    });
  }

  async markAsCompleted(id: string): Promise<void> {
  const intakeRef = doc(
    this.firebase,
    'material-intake',
    id
  );

  await updateDoc(intakeRef, {
    status: 'completed',
  });
}
}