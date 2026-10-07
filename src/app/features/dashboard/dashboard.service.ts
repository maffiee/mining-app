import { Injectable, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { CompanyRevenueService } from '../company-revenue/company-revenue.service';
import { CompanyExpenseService } from '../company-expense/company-expense.service';

@Injectable({ providedIn: 'root' })
export class CompanyProfitService {
  private readonly revenueService = inject(CompanyRevenueService);
  private readonly expenseService = inject(CompanyExpenseService);

  getProfitSummary() {
    return combineLatest([
      this.revenueService.getAll(),
      this.expenseService.getAll(),
      this.revenueService.getTotal(),
      this.expenseService.getTotal()
    ]).pipe(
      map(([revenues, expenses, totalRev, totalExp]) => {
        const profit = totalRev - totalExp;
        const margin = totalRev > 0? (profit / totalRev) * 100 : 0;

        // Group by month
        const monthly: Record<string, { revenue: number, expense: number, profit: number }> = {};

        revenues.forEach(r => {
          const month = (r.revenueDate || '').substring(0,7) || 'Unknown';
          if (!monthly[month]) monthly[month] = { revenue: 0, expense: 0, profit: 0 };
          monthly[month].revenue += Number(r.totalAmount||0);
        });

        expenses.forEach(e => {
          const month = (e.expenseDate || '').substring(0,7) || 'Unknown';
          if (!monthly[month]) monthly[month] = { revenue: 0, expense: 0, profit: 0 };
          monthly[month].expense += Number(e.amount||0);
        });

        Object.keys(monthly).forEach(m => {
          monthly[m].profit = monthly[m].revenue - monthly[m].expense;
        });

        return {
          totalRevenue: totalRev,
          totalExpenses: totalExp,
          netProfit: profit,
          margin,
          monthly: Object.entries(monthly).sort().map(([month, data]) => ({ month,...data })),
          revenueCount: revenues.length,
          expenseCount: expenses.length
        };
      })
    );
  }
}