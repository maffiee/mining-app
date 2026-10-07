import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MineralInventoryService } from './mineral-inventory.service';

@Component({
  selector: 'app-mineral-inventory-list',
  standalone: true,
  imports: [IonToolbar, IonHeader, IonContent, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './mineral-inventory.page.html',
})
export class MineralInventoryPage {
  private readonly service = inject(MineralInventoryService);

  readonly inventory = toSignal(this.service.getAll(), {
    initialValue: [],
  });

  readonly searchTerm = signal('');

  readonly filteredInventory = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    if (!search) return this.inventory();
    return this.inventory().filter(i => i.mineralType.toLowerCase().includes(search));
  });


  async fixInventory(): Promise<void> {
    await this.service.recalculateAll();
    alert('Inventory recalculated from all processing records');
  }
  // Optional: quick total
  readonly totals = computed(() => {
    const list = this.inventory();
    return {
      monazite: list.find(x => x.mineralType === 'monazite')?.totalQuantity?? 0,
      zircon: list.find(x => x.mineralType === 'zircon')?.totalQuantity?? 0,
      iron: list.find(x => x.mineralType === 'iron')?.totalQuantity?? 0,
    };
  });
}