import { Component, computed, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyRevenueService } from './company-revenue.service';

@Component({
  selector: 'app-company-revenue-list',
  standalone: true,
  imports: [IonToolbar, IonHeader, IonContent, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './company-revenue.page.html',
})
export class CompanyRevenuePage {
  private readonly service = inject(CompanyRevenueService);

  readonly revenues = toSignal(this.service.getAll(), { initialValue: [] });
  readonly totalRevenue = toSignal(this.service.getTotal(), { initialValue: 0 });
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const s = this.searchTerm().toLowerCase();
    if (!s) return this.revenues();
    return this.revenues().filter(r => r.buyerName.toLowerCase().includes(s));
  });

  async fixRevenue() {
    await this.service.recalculateAll();
    alert('Revenue recalculated from all sales');
  }
}