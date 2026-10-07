import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CompanyExpenseService } from '../company-expense.service';

@Component({
  selector: 'app-company-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './company-expense-form.component.html',
})
export class CompanyExpenseFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CompanyExpenseService);
  private readonly dialogRef = inject(MatDialogRef<CompanyExpenseFormComponent>);

  loading = false;

  readonly form = this.fb.nonNullable.group({
    category: ['diesel' as const, Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['', Validators.required],
    expenseDate: [new Date().toISOString().split('T')[0], Validators.required],
  });

  close() { this.dialogRef.close(); }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    try {
      const v = this.form.getRawValue();
      await this.service.create({
        category: v.category as any,
        amount: v.amount,
        description: v.description,
        expenseDate: v.expenseDate,
      });
      this.dialogRef.close(true);
    } finally { this.loading = false; }
  }
}