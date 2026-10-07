import { Component, computed, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { StaffService } from './staff.service';
import { StaffFormComponent } from './staff-form/staff-form.component';
import { StaffPaymentFormComponent } from './staff-payment-form/staff-payment-form.component';
import { StaffPaymentService } from '../staff-payment/staff-payment.service';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [IonContent, FormsModule, DecimalPipe],
  templateUrl: './staff.page.html',
})
export class StaffPage {
  private readonly service = inject(StaffService);
  private readonly paymentService = inject(StaffPaymentService);
  private readonly dialog = inject(MatDialog);

  readonly staffList = toSignal(this.service.getAll(), { initialValue: [] as any[] });
  readonly payments = toSignal(this.paymentService.getAll(), { initialValue: [] as any[] });
  readonly searchTerm = signal('');
  readonly bulkPaying = signal(false);

  readonly currentMonth = new Date().toISOString().substring(0,7);

  readonly paidIdsThisMonth = computed(() => {
    const set = new Set<string>();
    this.payments().forEach((p:any) => {
      if (p.paymentMonth === this.currentMonth) set.add(p.staffId);
    });
    return set;
  });

  readonly filtered = computed(() => {
    const s = this.searchTerm().toLowerCase();
    if (!s) return this.staffList();
    return this.staffList().filter((st:any) => st.fullName.toLowerCase().includes(s) || st.role.includes(s));
  });

  readonly totalMonthlyWage = computed(() =>
    this.staffList().filter((s:any)=>s.status==='active').reduce((sum:any, st:any) => sum + Number(st.salaryAmount||0), 0)
  );

  readonly unpaidThisMonth = computed(() =>
    this.staffList().filter((s:any) => s.status==='active' &&!this.paidIdsThisMonth().has(s.id))
  );

  isPaid(staffId: string): boolean {
    return this.paidIdsThisMonth().has(staffId);
  }

  openAdd() { this.dialog.open(StaffFormComponent, { width: '500px' }); }

  openPay(staff: any) {
    if (this.isPaid(staff.id)) {
      alert(`${staff.fullName} already paid for ${this.currentMonth}`);
      return;
    }
    this.dialog.open(StaffPaymentFormComponent, { width: '500px', data: staff });
  }

  async payAllForCurrentMonth() {
    const unpaid = this.unpaidThisMonth();
    if (!unpaid.length) {
      alert(`All active staff already paid for ${this.currentMonth}`);
      return;
    }
    const total = unpaid.reduce((s:any, st:any) => s + Number(st.salaryAmount||0), 0);
    if (!confirm(`Pay remaining ${unpaid.length} staff for ${this.currentMonth}? Total ₦${total.toLocaleString()} will be added as labor expense.\n\nAlready paid: ${this.paidIdsThisMonth().size} staff will be skipped.`)) return;

    this.bulkPaying.set(true);
    try {
      for (const staff of unpaid) {
        await this.paymentService.create({
          staffId: staff.id,
          staffName: staff.fullName,
          role: staff.role,
          amount: staff.salaryAmount,
          paymentType: 'salary',
          paymentMonth: this.currentMonth,
          paymentDate: new Date().toISOString().split('T')[0],
          description: `${this.currentMonth} bulk payroll`,
        });
      }
      alert(`Payroll done for ${this.currentMonth} - ${unpaid.length} staff paid. ${this.paidIdsThisMonth().size} already-paid staff were skipped.`);
    } catch (e:any) {
      alert(e.message);
    } finally { this.bulkPaying.set(false); }
  }
}