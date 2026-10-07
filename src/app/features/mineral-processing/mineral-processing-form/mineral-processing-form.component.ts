import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';

import { CustomerService } from '../../customers/customer.service';
import { MineralProcessingService } from '../mineral-processing-service';
import { MineralInventoryService } from '../../mineral-inventory/mineral-inventory.service';
import { MaterialIntakeService } from '../../material-intake/material-intake.service';

@Component({
  selector: 'app-mineral-processing-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './mineral-processing-form.component.html',
})
export class MineralProcessingFormComponent {

  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(MineralInventoryService);
  private readonly processingService = inject(MineralProcessingService);
  private readonly customerService = inject(CustomerService);
  private readonly materialIntakeService = inject(MaterialIntakeService);
  private readonly dialogRef =
    inject(MatDialogRef<MineralProcessingFormComponent>);

  readonly customers = toSignal(
    this.customerService.getCustomers(),
    { initialValue: [] }
  );

  readonly intakes = toSignal(
    this.materialIntakeService.getMaterialIntakes(),
    { initialValue: [] }
  );

  readonly selectedCustomerId = signal('');

  loading = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    inputMaterial: ['', Validators.required],
    inputQuantity: [
      0,
      [Validators.required, Validators.min(1)]
    ],
    inputUnit: ['kg', Validators.required],
    monaziteQuantity: [
      0,
      [Validators.required, Validators.min(0)]
    ],
    ironQuantity: [
      0,
      [Validators.required, Validators.min(0)]
    ],
    zirconQuantity: [
      0,
      [Validators.required, Validators.min(0)]
    ],
    date: [
      new Date().toISOString().split('T')[0],
      Validators.required
    ],
    notes: [''],
  });
  readonly selectedIntake = computed(() => {
    const customerId = this.selectedCustomerId();

    if (!customerId) {
      return undefined;
    }

    return this.intakes().find(
      intake =>
        intake.customerId === customerId &&
        intake.status !== 'completed'
    );
  });

  onCustomerChange(customerId: string): void {

    this.selectedCustomerId.set(customerId);

    const intake = this.intakes().find(
      intake =>
        intake.customerId === customerId &&
        intake.status !== 'completed'
    );

    if (!intake) {
      this.form.patchValue({
        inputMaterial: '',
        inputQuantity: 0,
        inputUnit: 'kg',
      });

      this.errorMessage =
        'No pending material intake found for this customer.';

      return;
    }

    this.errorMessage = '';

    this.form.patchValue({
      inputMaterial: intake.materialType,
      inputQuantity: intake.quantity,
      inputUnit: intake.unit,
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  try {
    const formValue = this.form.getRawValue();

    const selectedCustomer = this.customers().find(
      customer => customer.id === formValue.customerId
    );

    if (!selectedCustomer) {
      throw new Error('Please select a valid customer.');
    }

    const intake = this.selectedIntake();

    if (!intake) {
      throw new Error(
        'No pending material intake found for this customer.'
      );
    }

    const processing = {
      intakeId: intake.id,

      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,

      inputMaterial: intake.materialType,
      inputQuantity: intake.quantity,
      inputUnit: intake.unit,

      monaziteQuantity: formValue.monaziteQuantity,
      ironQuantity: formValue.ironQuantity,
      zirconQuantity: formValue.zirconQuantity,

      date: formValue.date,
      notes: formValue.notes,
    };

    // 1. Save processing
    await this.processingService.create(processing);

    // 2. Mark the original intake as completed
    await this.materialIntakeService.markAsCompleted(
      intake.id
    );

    // 3. Add recovered minerals to inventory
    await this.inventoryService.addFromProcessing(
      processing as any
    );

    // 4. Everything succeeded
    this.dialogRef.close(true);

  } catch (error) {
    console.error('Mineral processing error:', error);

    this.errorMessage =
      error instanceof Error
        ? error.message
        : 'Unable to save processing record.';

  } finally {
    this.loading = false;
  }
}

  readonly pendingCustomers = computed(() => {
    const pendingIntakes = this.intakes().filter(
      intake => intake.status !== 'completed'
    );

    const customerIds = new Set(
      pendingIntakes.map(intake => intake.customerId)
    );

    return this.customers().filter(customer => customerIds.has(customer.id));
  })
}