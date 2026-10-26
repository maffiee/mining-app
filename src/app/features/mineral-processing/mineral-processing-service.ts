import { Injectable, inject } from '@angular/core';
import {  Firestore, addDoc, collection, collectionData, serverTimestamp, } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MineralProcessing } from './mineral-processing.model';
import { AuditLogService } from '../../core/services/audit-log.service';

@Injectable({
  providedIn: 'root',
})
export class MineralProcessingService {

  private readonly firestore = inject(Firestore);
  private readonly auditLogService = inject(AuditLogService);

  private readonly processingCollection = collection(this.firestore, 'mineralProcessing');


  getAll(): Observable<MineralProcessing[]> {
    return collectionData( this.processingCollection,
      { idField: 'id' }
    ) as Observable<MineralProcessing[]>;
  }


  async create( processing: Omit< MineralProcessing, 'id' | 'createdAt' | 'status'> ): Promise<string> {

    const docRef = await addDoc( this.processingCollection, {
      ...processing,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      await this.auditLogService.log({
        action: 'CREATE',
        collection: 'mineralProcessing',
        recordId: docRef.id,
        description: `Processed ${processing.inputQuantity}${processing.inputUnit} of ${processing.inputMaterial} for customer ${processing.customerName}`
      });

    return docRef.id;
  }
}