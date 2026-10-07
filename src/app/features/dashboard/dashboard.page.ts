import { Component, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { DecimalPipe, DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
import { CompanyProfitService } from '../company-profit/company-profit.service';
import { MineralInventoryService } from '../mineral-inventory/mineral-inventory.service';
import { MineralSaleService } from '../mineral-sales/mineral-sale.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IonContent, DecimalPipe, DatePipe],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  private readonly profitService = inject(CompanyProfitService);
  private readonly inventoryService = inject(MineralInventoryService);
  private readonly saleService = inject(MineralSaleService);

  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;

  readonly summary = toSignal(this.profitService.getProfitSummary(), {
    initialValue: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, margin: 0, monthly: [], revenueCount: 0, expenseCount: 0 } as any
  });

  readonly inventory = toSignal(this.inventoryService.getAll(), { initialValue: [] as any[] });
  readonly sales = toSignal(this.saleService.getAll(), { initialValue: [] as any[] });

  readonly totalInventoryKg = toSignal(
    this.inventoryService.getAll().pipe(
      map(items => items.reduce((s, i) => s + Number(i.totalQuantity||0), 0))
    ), { initialValue: 0 }
  );

  readonly recentSales = toSignal(
    this.saleService.getAll().pipe(
      map(sales => [...sales].sort((a:any,b:any) => (b.saleDate||'').localeCompare(a.saleDate||'')).slice(0,5))
    ), { initialValue: [] as any[] }
  );
}