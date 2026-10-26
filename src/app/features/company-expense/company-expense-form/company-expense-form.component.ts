import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CompanyExpenseService } from '../company-expense.service';

@Component({
  selector: 'app-company-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './company-expense-form.component.html',
})
export class CompanyExpenseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CompanyExpenseService);
  private readonly dialogRef = inject(MatDialogRef<CompanyExpenseFormComponent>);

  // NEW: receive expense for editing
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as any;

  loading = false;
  isEdit = false;

  readonly form = this.fb.nonNullable.group({
    category: ['diesel' as const, Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['', Validators.required],
    expenseDate: [new Date().toISOString().split('T')[0], Validators.required],
  });

  ngOnInit() {
    if (this.data?.id) {
      this.isEdit = true;
      this.form.patchValue({
        category: this.data.category,
        amount: this.data.amount,
        description: this.data.description,
        expenseDate: this.data.expenseDate?.toDate?
          this.data.expenseDate.toDate().toISOString().split('T')[0] :
          this.data.expenseDate?.split('T')[0]?? this.data.expenseDate,
      });
    }
  }

  close() { this.dialogRef.close(); }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    try {
      const v = this.form.getRawValue();
      const payload = {
        category: v.category as any,
        amount: v.amount,
        description: v.description,
        expenseDate: v.expenseDate,
      } as any;

      if (this.isEdit) {
        await this.service.update(this.data.id, payload);
      } else {
        await this.service.create(payload);
      }
      this.dialogRef.close(true);
    } finally { this.loading = false; }
  }
}