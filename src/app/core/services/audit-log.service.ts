import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, orderBy, query, serverTimestamp } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface AuditLog {
  id?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEDUCT' | 'LOGIN' | 'PAYMENT';
  collection: string;
  recordId: string;
  description: string; // e.g. "Sold 100kg Monazite for ₦50,000 to Mr Li"
  before?: any;
  after?: any;
  userEmail: string;
  userId?: string;
  createdAt: any;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly col = collection(this.firestore, 'auditLogs');

  getAll(): Observable<AuditLog[]> {
    const q = query(this.col, orderBy('createdAt', 'desc'));
    return collectionData (q, { idField: 'id' }) as Observable<AuditLog[]>;
  }

  async log(data: Omit<AuditLog, 'id' | 'userEmail' | 'userId' | 'createdAt'>): Promise<void> {
    const user = this.authService.user();
    if (!user) {
      throw new Error('User not authenticated');
    }

    await addDoc(this.col, {
      ...data,
      userEmail: user.email,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  }

}