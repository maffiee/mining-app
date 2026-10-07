import { Component, computed, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { StaffPaymentService } from './staff-payment.service';

@Component({
  selector: 'app-staff-payment-list',
  standalone: true,
  imports: [IonContent, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './staff-payment.page.html',
})
export class StaffPaymentPage {
  private readonly service = inject(StaffPaymentService);
  readonly payments = toSignal(this.service.getAll(), { initialValue: [] as any[] });
  readonly searchMonth = signal(new Date().toISOString().substring(0,7));

  readonly filtered = computed(() => {
    const month = this.searchMonth();
    if (!month) return this.payments();
    return this.payments().filter((p:any) => p.paymentMonth === month);
  });

  readonly totalForMonth = computed(() =>
    this.filtered().reduce((s:any, p:any) => s + Number(p.amount||0), 0)
  );
}