import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, getDocs, increment, serverTimestamp, setDoc, runTransaction } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MineralProcessing } from '../mineral-processing/mineral-processing.model';

export type MineralType = 'monazite' | 'zircon' | 'iron';

export interface MineralInventory {
  id: string;
  mineralType: MineralType;
  totalQuantity: number;
  unit: string;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root',
})
export class MineralInventoryService {
  private readonly firestore = inject(Firestore);
  private readonly inventoryCollection = collection(this.firestore, 'mineralInventory');

  getAll(): Observable<MineralInventory[]> {
    return collectionData(this.inventoryCollection, { idField: 'id' }) as Observable<MineralInventory[]>;
  }

  async addFromProcessing(processing: MineralProcessing): Promise<void> {
    const updates: { type: MineralType; qty: number }[] = [
      { type: 'monazite', qty: processing.monaziteQuantity },
      { type: 'zircon', qty: processing.zirconQuantity },
      { type: 'iron', qty: processing.ironQuantity },
    ];

    for (const item of updates) {
      if (!item.qty || item.qty <= 0) continue;
      const ref = doc(this.firestore, 'mineralInventory', item.type);
      await setDoc(ref, {
        id: item.type,
        mineralType: item.type,
        totalQuantity: increment(item.qty),
        unit: 'kg',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }

  async deduct(mineralType: MineralType, qty: number): Promise<void> {
    const ref = doc(this.firestore, 'mineralInventory', mineralType);
    
    await runTransaction(this.firestore, async (transaction) => {
      const snap = await transaction.get(ref);
      const current = snap.exists() ? Number((snap.data() as any).totalQuantity || 0) : 0;
      
      if (current < qty) {
        throw new Error(`Insufficient ${mineralType} stock. Available: ${current} kg, requested: ${qty} kg`);
      }

      transaction.set(ref, {
        totalQuantity: increment(-qty),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    });
  }

  async adjust(mineralType: MineralType, oldQty: number, newQty: number): Promise<void> {
    const diff = newQty - oldQty;
    if (diff === 0) return;
    
    if (diff > 0) {
      await this.deduct(mineralType, diff);
    } else {
      const ref = doc(this.firestore, 'mineralInventory', mineralType);
      await setDoc(ref, {
        totalQuantity: increment(Math.abs(diff)),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }

  async recalculateAll(): Promise<void> {
    const processingCol = collection(this.firestore, 'mineralProcessing');
    const salesCol = collection(this.firestore, 'mineralSales');
    
    const [processingSnap, salesSnap] = await Promise.all([
      getDocs(processingCol),
      getDocs(salesCol)
    ]);

    let monazite = 0, zircon = 0, iron = 0;

    processingSnap.forEach(d => {
      const data: any = d.data();
      monazite += Number(data.monaziteQuantity || 0);
      zircon += Number(data.zirconQuantity || 0);
      iron += Number(data.ironQuantity || 0);
    });

    salesSnap.forEach(d => {
      const data: any = d.data();
      const qty = Number(data.quantity || 0);
      if (data.mineralType === 'monazite') monazite -= qty;
      if (data.mineralType === 'zircon') zircon -= qty;
      if (data.mineralType === 'iron') iron -= qty;
    });

    const now = serverTimestamp();
    await Promise.all([
      setDoc(doc(this.firestore, 'mineralInventory', 'monazite'), {
        id: 'monazite', mineralType: 'monazite', totalQuantity: Math.max(0, monazite), unit: 'kg', updatedAt: now
      }, { merge: true }),
      setDoc(doc(this.firestore, 'mineralInventory', 'zircon'), {
        id: 'zircon', mineralType: 'zircon', totalQuantity: Math.max(0, zircon), unit: 'kg', updatedAt: now
      }, { merge: true }),
      setDoc(doc(this.firestore, 'mineralInventory', 'iron'), {
        id: 'iron', mineralType: 'iron', totalQuantity: Math.max(0, iron), unit: 'kg', updatedAt: now
      }, { merge: true })
    ]);
  }
}