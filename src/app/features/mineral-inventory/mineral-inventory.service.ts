
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDocs, increment, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MineralProcessing } from '../mineral-processing/mineral-processing.model';

export type MineralType = 'monazite' | 'zircon' | 'iron';

export interface MineralInventory {
  id: string; // monazite | zircon | iron
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
  private readonly inventoryCollection = collection(
    this.firestore,
    'mineralInventory'
  );

  getAll(): Observable<MineralInventory[]> {
    return collectionData(
      this.inventoryCollection,
      { idField: 'id' }
    ) as Observable<MineralInventory[]>;
  }

// Called automatically when processing is completed
  async addFromProcessing(processing: MineralProcessing): Promise<void> {
    const updates: { type: MineralType; qty: number }[] = [
      { type: 'monazite', qty: processing.monaziteQuantity },
      { type: 'zircon', qty: processing.zirconQuantity },
      { type: 'iron', qty: processing.ironQuantity },
    ];

    for (const item of updates) {
      if (!item.qty || item.qty <= 0) continue;

      const ref = doc(this.firestore, 'mineralInventory', item.type);
      // setDoc with merge + increment works even if doc doesn't exist
      await setDoc(ref, {
        id: item.type,
        mineralType: item.type,
        totalQuantity: increment(item.qty),
        unit: 'kg',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }

  // For future: when sale happens
  async deduct(mineralType: MineralType, qty: number): Promise<void> {
    const ref = doc(this.firestore, 'mineralInventory', mineralType);
    await setDoc(ref, {
      totalQuantity: increment(-qty),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  async recalculateAll(): Promise<void> {
  // 1. Get all processing records
  const processingCol = collection(this.firestore, 'mineralProcessing');
  const snapshot = await getDocs(processingCol);

  let monazite = 0, zircon = 0, iron = 0;

  snapshot.forEach(doc => {
    const data: any = doc.data();
    monazite += Number(data.monaziteQuantity || 0);
    zircon += Number(data.zirconQuantity || 0);
    iron += Number(data.ironQuantity || 0);
  });

  // 2. Overwrite inventory with real totals
  const now = serverTimestamp();
  await setDoc(doc(this.firestore, 'mineralInventory', 'monazite'), {
    id: 'monazite', mineralType: 'monazite', totalQuantity: monazite, unit: 'kg', updatedAt: now
  }, { merge: true });

  await setDoc(doc(this.firestore, 'mineralInventory', 'zircon'), {
    id: 'zircon', mineralType: 'zircon', totalQuantity: zircon, unit: 'kg', updatedAt: now
  }, { merge: true });

  await setDoc(doc(this.firestore, 'mineralInventory', 'iron'), {
    id: 'iron', mineralType: 'iron', totalQuantity: iron, unit: 'kg', updatedAt: now
  }, { merge: true });
}
}