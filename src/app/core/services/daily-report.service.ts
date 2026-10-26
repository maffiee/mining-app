import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from '@angular/fire/firestore';

export interface SaleDetail {
  id: string;
  buyerName: string;
  buyerLocation: string;
  mineralType: string;
  quantity: number;
  totalAmount: number;
  saleDate: string;
  saleTime: string;
  staffEmail?: string;
  createdAt: Date;
}

export interface DayReport {
  date: string;
  intakeKg: number;
  processedKg: number;
  salesKg: number;
  salesNaira: number;
  expenseNaira: number;
  revenueNaira?: number;
  profit: number;
  lossFlag: boolean;
  salesDetails: SaleDetail[];
  stockLeft?: number;
}

@Injectable({ providedIn: 'root' })
export class DailyReportService {
  private readonly firestore = inject(Firestore);

  private toDate(d: any): Date {
    if (!d) return new Date(0);
    if (d.toDate) return d.toDate();
    if (d.seconds) return new Date(d.seconds * 1000);
    if (d instanceof Date) return d;
    return new Date(d);
  }

  private isSameDay(docDate: any, targetStr: string): boolean {
    const d = this.toDate(docDate);
    const str = d.toISOString().split('T')[0];
    return str === targetStr;
  }

  private getDateKey(docDate: any): string | null {
    if (!docDate) return null;
    try {
      return this.toDate(docDate).toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  // Fetch all collections once and group by day
  private async getBulkData() {
    const [intakeSnap, procSnap, salesSnap, revSnap, expSnap, inventorySnap] = await Promise.all([
      getDocs(collection(this.firestore, 'materialIntakes')),
      getDocs(collection(this.firestore, 'mineralProcessing')),
      getDocs(collection(this.firestore, 'mineralSales')),
      getDocs(collection(this.firestore, 'companyRevenues')),
      getDocs(collection(this.firestore, 'companyExpenses')),
      getDocs(collection(this.firestore, 'mineralInventory')),
    ]);

    const groupByDay = (snap: any, primaryFields: string[]) => {
      const map = new Map<string, any[]>();
      snap.forEach((docSnap: any) => {
        const data = docSnap.data();
        const raw = primaryFields.map(f => data[f]).find(v => !!v) || data.createdAt || data.date;
        const key = this.getDateKey(raw);
        if (!key) return;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ _id: docSnap.id, ...data });
      });
      return map;
    };

    let stockLeft = 0;
    inventorySnap.forEach((docSnap: any) => {
      const data = docSnap.data() as any;
      stockLeft += Number(data.totalQuantity || 0);
    });

    return {
      intakeByDay: groupByDay(intakeSnap, ['intakeDate', 'date']),
      procByDay: groupByDay(procSnap, ['processingDate', 'date']),
      salesByDay: groupByDay(salesSnap, ['saleDate', 'date']),
      revByDay: groupByDay(revSnap, ['revenueDate', 'date']),
      expByDay: groupByDay(expSnap, ['expenseDate', 'date']),
      stockLeft,
      // Keep raw snaps for single-day fallback if needed
      raw: { intakeSnap, procSnap, salesSnap, revSnap, expSnap }
    };
  }

  private buildDayReport(dateStr: string, bulk: Awaited<ReturnType<DailyReportService['getBulkData']>>): DayReport {
    const intakeDocs = bulk.intakeByDay.get(dateStr) || [];
    const procDocs = bulk.procByDay.get(dateStr) || [];
    const salesDocs = bulk.salesByDay.get(dateStr) || [];
    const revDocs = bulk.revByDay.get(dateStr) || [];
    const expDocs = bulk.expByDay.get(dateStr) || [];

    let intakeKg = 0;
    let processedKg = 0;
    let salesKg = 0;
    let salesNaira = 0;
    let expenseNaira = 0;
    let revenueNaira = 0;
    const salesDetails: SaleDetail[] = [];

    intakeDocs.forEach((data: any) => {
      intakeKg += Number(data.quantity || data.totalWeight || 0);
    });

    procDocs.forEach((data: any) => {
      processedKg += Number(data.monaziteQuantity || 0) + Number(data.zirconQuantity || 0) + Number(data.ironQuantity || 0);
    });

    salesDocs.forEach((data: any) => {
      salesKg += Number(data.quantity || 0);
      salesNaira += Number(data.totalAmount || 0);
      const created = this.toDate(data.createdAt || data.saleDate);
      salesDetails.push({
        id: data._id,
        buyerName: data.buyerName || 'Unknown',
        buyerLocation: data.buyerLocation || '',
        mineralType: data.mineralType,
        quantity: Number(data.quantity || 0),
        totalAmount: Number(data.totalAmount || 0),
        saleDate: data.saleDate,
        saleTime: created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        staffEmail: data.createdBy || data.userEmail || 'System',
        createdAt: created
      });
    });

    salesDetails.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    revDocs.forEach((data: any) => {
      revenueNaira += Number(data.totalAmount || data.amount || 0);
    });

    expDocs.forEach((data: any) => {
      expenseNaira += Number(data.amount || 0);
    });

    // If no explicit revenue collection, use salesNaira as revenue
    const effectiveRevenue = revenueNaira > 0 ? revenueNaira : salesNaira;

    return {
      date: dateStr,
      intakeKg,
      processedKg,
      salesKg,
      salesNaira,
      expenseNaira,
      revenueNaira: effectiveRevenue,
      stockLeft: bulk.stockLeft,
      profit: effectiveRevenue - expenseNaira,
      lossFlag: intakeKg > 0 && (intakeKg - processedKg) / intakeKg > 0.05,
      salesDetails
    };
  }

  async getReportForDate(dateStr: string): Promise<DayReport> {
    // Single day still needs 6 reads - acceptable for autoSave
    // For history, use getHistory() which is optimized
    const bulk = await this.getBulkData();
    return this.buildDayReport(dateStr, bulk);
  }

  async getTodayReport() {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.getReportForDate(todayStr);
  }

  async getHistory(days = 30): Promise<DayReport[]> {
    const bulk = await this.getBulkData();
    const reports: DayReport[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const report = this.buildDayReport(dateStr, bulk);
      if (this.isEmptyReport(report)) continue;
      reports.push(report);
    }
    return reports;
  }

  async getMonthReport(): Promise<DayReport> {
    // Optimized - don't fetch again, just use history
    const history = await this.getHistory(31);
    const monthStr = new Date().toISOString().substring(0, 7);
    const monthData = history.filter(r => r.date.startsWith(monthStr));
    return {
      date: monthStr,
      intakeKg: monthData.reduce((s, r) => s + r.intakeKg, 0),
      processedKg: monthData.reduce((s, r) => s + r.processedKg, 0),
      salesKg: monthData.reduce((s, r) => s + r.salesKg, 0),
      salesNaira: monthData.reduce((s, r) => s + r.salesNaira, 0),
      expenseNaira: monthData.reduce((s, r) => s + r.expenseNaira, 0),
      profit: monthData.reduce((s, r) => s + r.profit, 0),
      lossFlag: false,
      salesDetails: [],
      stockLeft: history[0]?.stockLeft || 0
    };
  }

  async autoSaveDailyReport(): Promise<void> {
    const todayStr = new Date().toISOString().split('T')[0];
    const report = await this.getReportForDate(todayStr);

    if (this.isEmptyReport(report)) {
      return;
    }

    const ref = doc(this.firestore, 'dailyReports', todayStr);
    const snap = await getDoc(ref);
    if (!snap.exists() || this.hasChanged(snap.data() as any, report)) {
      await setDoc(ref, {
        ...report,
        savedAt: serverTimestamp(),
        autoSaved: true
      }, { merge: true });
    }
  }

  private isEmptyReport(report: DayReport): boolean {
    return report.intakeKg === 0 &&
      report.processedKg === 0 &&
      report.salesKg === 0 &&
      report.salesNaira === 0 &&
      report.expenseNaira === 0 &&
      (report.salesDetails?.length ?? 0) === 0;
  }

  private hasChanged(old: any, current: DayReport): boolean {
    if (!old) return true;
    return old.salesNaira !== current.salesNaira ||
           old.expenseNaira !== current.expenseNaira ||
           old.salesKg !== current.salesKg ||
           old.intakeKg !== current.intakeKg ||
           old.processedKg !== current.processedKg;
  }

  async getSavedReports(limitDays = 90): Promise<DayReport[]> {
    const col = collection(this.firestore, 'dailyReports');
    const q = query(col, orderBy('date', 'desc'), limit(limitDays));
    const snap = await getDocs(q);
    const reports: DayReport[] = [];
    snap.forEach(d => reports.push(d.data() as DayReport));
    return reports;
  }
}