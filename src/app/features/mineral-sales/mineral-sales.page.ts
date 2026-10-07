import { Component, computed, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MineralSaleService } from './mineral-sale.service';
import { MineralSaleFormComponent } from '../mineral-sales/mineral-sales-form/mineral-sales-form.component';

@Component({
  selector: 'app-mineral-sale-list',
  standalone: true,
  imports: [IonTitle, IonToolbar, IonHeader, IonContent, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './mineral-sales.page.html',
})
export class MineralSalesPage {
  private readonly service = inject(MineralSaleService);
  private readonly dialog = inject(MatDialog);

  readonly sales = toSignal(this.service.getAll(), { initialValue: [] });
  readonly searchTerm = signal('');

  readonly filteredSales = computed(() => {
    const s = this.searchTerm().trim().toLowerCase();
    if (!s) return this.sales();
    return this.sales().filter(x => x.buyerName.toLowerCase().includes(s));
  });

  openAddSale(): void {
    this.dialog.open(MineralSaleFormComponent, { width: '650px', maxWidth: '95vw' });
  }
}