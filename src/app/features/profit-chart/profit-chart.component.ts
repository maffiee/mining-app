import { Component, computed, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyRevenueService } from '../company-revenue/company-revenue.service';
import { CompanyExpenseService } from '../company-expense/company-expense.service';

@Component({
  selector: 'app-profit-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 class="font-bold">Monthly Profit - 2026</h3>
      <p class="text-xs text-slate-500 mt-1">Revenue vs Expenses vs Net Profit</p>
      <div class="mt-6 h-">
        <canvas baseChart [data]="chartData()" [options]="chartOptions" [type]="'bar'"></canvas>
      </div>
    </div>
  `
})
export class ProfitChartComponent {
  private revenueService = inject(CompanyRevenueService);
  private expenseService = inject(CompanyExpenseService);

  private revenues = toSignal(this.revenueService.getAll(), { initialValue: [] as any[] });
  private expenses = toSignal(this.expenseService.getAll(), { initialValue: [] as any[] });

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  };

  private months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  chartData = computed<ChartConfiguration['data']>(() => {
    const revByMonth = new Array(12).fill(0);
    const expByMonth = new Array(12).fill(0);

    this.revenues().forEach((r:any) => {
      const m = new Date(r.revenueDate || r.saleDate).getMonth();
      revByMonth[m] += Number(r.amount || 0);
    });
    this.expenses().forEach((e:any) => {
      const m = new Date(e.expenseDate).getMonth();
      expByMonth[m] += Number(e.amount || 0);
    });

    const profitByMonth = revByMonth.map((rev, i) => rev - expByMonth[i]);

    return {
      labels: this.months,
      datasets: [
        { label: 'Revenue (Chinese Sales)', data: revByMonth, backgroundColor: '#0f172a' },
        { label: 'Expenses (Transport + Customers + Labor + Diesel)', data: expByMonth, backgroundColor: '#f59e0b' },
        { label: 'Net Profit', data: profitByMonth, backgroundColor: '#16a34a', type: 'line' as any }
      ]
    };
  });
}