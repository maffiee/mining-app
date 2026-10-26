import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DailyReportService, DayReport } from '../../core/services/daily-report.service';
import { AuditLogService, AuditLog } from '../../core/services/audit-log.service';
import { BuyerService } from '../../core/services/buyer.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-daily-report',
  standalone: true,
  imports: [CommonModule, IonContent, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './daily-report.page.html',
})
export class DailyReportPage implements OnInit {
  private readonly reportService = inject(DailyReportService);
  private readonly auditService = inject(AuditLogService);
  private readonly buyerService = inject(BuyerService);

  report = signal<any>(null);
  history = signal<DayReport[]>([]);
  monthReport = signal<any>(null);
  auditLogs = signal<AuditLog[]>([]);
  loading = signal(true);
  filter = signal<'week'|'month'|'30days'|'all'>('week');
  selectedDay = signal<DayReport | null>(null);

  totalDebt = signal(0);
  buyers = toSignal(this.buyerService.getAll(), { initialValue: [] as any[] });

  historyTitle = computed(() => {
    switch(this.filter()) {
      case 'week': return 'Audit History - Weekly (Last 7 Days)';
      case 'month': return 'Audit History - Monthly (This Month)';
      case '30days': return 'Audit History - Last 30 Days';
      case 'all': return 'Audit History - All Time';
      default: return 'Audit History';
    }
  });

  filteredHistory = computed(() => {
    const all = this.history();
    if (this.filter() === 'week') return all.slice(0, 7);
    if (this.filter() === 'month') {
      const monthStr = new Date().toISOString().substring(0,7);
      return all.filter(r => r.date.startsWith(monthStr));
    }
    if (this.filter() === '30days') return all.slice(0, 30);
    return all;
  });

  totalDebtComputed = computed(() => {
    return this.buyers().reduce((s: number, b: any) => s + (b.balance > 0 ? Number(b.balance) : 0), 0);
  });

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const historyData = await this.reportService.getHistory(90);
      const todayStr = new Date().toISOString().split('T')[0];
      const monthStr = new Date().toISOString().substring(0,7);
      
      // FIX: show latest if today not found, so cards always show
      this.report.set(historyData.find(r => r.date === todayStr) || historyData[0] || null);
      this.history.set(historyData);
      this.monthReport.set({
        date: monthStr,
        intakeKg: historyData.filter(r => r.date.startsWith(monthStr)).reduce((s,r) => s+r.intakeKg,0),
        processedKg: historyData.filter(r => r.date.startsWith(monthStr)).reduce((s,r) => s+r.processedKg,0),
        salesKg: historyData.filter(r => r.date.startsWith(monthStr)).reduce((s,r) => s+r.salesKg,0),
        salesNaira: historyData.filter(r => r.date.startsWith(monthStr)).reduce((s,r) => s+r.salesNaira,0),
        expenseNaira: historyData.filter(r => r.date.startsWith(monthStr)).reduce((s,r) => s+r.expenseNaira,0),
        profit: historyData.filter(r => r.date.startsWith(monthStr)).reduce((s,r) => s+r.profit,0),
        lossFlag: false,
        salesDetails: []
      });

      const debt = await this.buyerService.getTotalDebt().catch(() => 0);
      this.totalDebt.set(debt);

      const { firstValueFrom } = await import('rxjs');
      const { take } = await import('rxjs/operators');
      const audit = await firstValueFrom(this.auditService.getAll().pipe(take(1))).catch(() => []);
      this.auditLogs.set((audit as any[]).slice(0, 50));

    } finally {
      this.loading.set(false);
    }
  }

  viewDay(day: DayReport) {
    this.selectedDay.set(day);
  }

  closeDay() {
    this.selectedDay.set(null);
  }
}