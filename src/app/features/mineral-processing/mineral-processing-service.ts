import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  serverTimestamp,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { MineralProcessing } from './mineral-processing.model';

@Injectable({
  providedIn: 'root',
})
export class MineralProcessingService {

  private readonly firestore = inject(Firestore);

  private readonly processingCollection =
    collection(this.firestore, 'mineralProcessing');


  getAll(): Observable<MineralProcessing[]> {
    return collectionData(
      this.processingCollection,
      { idField: 'id' }
    ) as Observable<MineralProcessing[]>;
  }


  async create(
    processing: Omit<
      MineralProcessing,
      'id' | 'createdAt' | 'status'
    >
  ): Promise<string> {

    const docRef = await addDoc(
      this.processingCollection,
      {
        ...processing,

        status: 'completed',

        createdAt: serverTimestamp(),
      }
    );

    return docRef.id;
  }
}