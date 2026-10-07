import { Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyProfitService } from './company-profit.service';

@Component({
  selector: 'app-company-profit',
  standalone: true,
  imports: [IonToolbar, IonHeader, IonContent, DecimalPipe],
  templateUrl: './company-profit.page.html',
})
export class CompanyProfitPage {
  private readonly service = inject(CompanyProfitService);
  readonly summary = toSignal(this.service.getProfitSummary(), {
    initialValue: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, margin: 0, monthly: [], revenueCount: 0, expenseCount: 0 }
  });
}