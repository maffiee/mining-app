import { Component, computed, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyExpenseService } from './company-expense.service';
import { MatDialog } from '@angular/material/dialog';
import { CompanyExpenseFormComponent } from './company-expense-form/company-expense-form.component';

@Component({
  selector: 'app-company-expense-list',
  standalone: true,
  imports: [IonToolbar, IonHeader, IonContent, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './company-expense.page.html',
})
export class CompanyExpensePage {
  readonly service = inject(CompanyExpenseService);
  readonly dialog = inject(MatDialog);

  readonly expenses = toSignal(this.service.getAll(), { initialValue: [] });
  readonly total = toSignal(this.service.getTotal(), { initialValue: 0 });
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const s = this.searchTerm().toLowerCase();
    if (!s) return this.expenses();
    return this.expenses().filter(e => e.description.toLowerCase().includes(s) || e.category.includes(s));
  });

  async fixExpenses() {
    await this.service.recalculateAll();
    alert('Expenses recalculated: Transport + Customer Payments');
  }

   openAddExpense() {
    const ref = this.dialog.open(CompanyExpenseFormComponent, { width: '480px' });
    ref.afterClosed().subscribe(done => {
      if (done) { /* list auto updates via firestore */ }
    });
  }
}