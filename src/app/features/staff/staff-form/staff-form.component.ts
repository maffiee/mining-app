import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { StaffService } from '../staff.service';

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './staff-form.component.html',
})
export class StaffFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(StaffService);
  private readonly dialogRef = inject(MatDialogRef<StaffFormComponent>);
  loading = false;

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: [''],
    role: ['processor' as const, Validators.required],
    salaryType: ['monthly' as const],
    salaryAmount: [0, [Validators.required, Validators.min(1000)]],
    employmentDate: [new Date().toISOString().split('T')[0], Validators.required],
    status: ['active' as const],
  });

  close() { this.dialogRef.close(); }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    try {
      await this.service.create(this.form.getRawValue());
      this.dialogRef.close(true);
    } finally { this.loading = false; }
  }
}