import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StaffPaymentService } from '../../staff-payment/staff-payment.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-staff-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './staff-payment-form.component.html',
})
export class StaffPaymentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(StaffPaymentService);
  private readonly dialogRef = inject(MatDialogRef<StaffPaymentFormComponent>);
  readonly staff = inject<any>(MAT_DIALOG_DATA);

  loading = false;

  readonly form = this.fb.nonNullable.group({
    amount: [this.staff?.salaryAmount || 0, [Validators.required, Validators.min(1)]],
    paymentType: ['salary' as const, Validators.required],
    paymentMonth: [new Date().toISOString().substring(0,7), Validators.required],
    paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
    description: [''],
  });

  close() { this.dialogRef.close(); }

  async save() {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      const v = this.form.getRawValue();
      await this.service.create({
        staffId: this.staff.id,
        staffName: this.staff.fullName,
        role: this.staff.role,
       ...v,
      });
      this.dialogRef.close(true);
    } finally { this.loading = false; }
  }
}