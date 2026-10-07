import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CustomerPaymentService } from '../customer-payment.service';
import { CustomerSettlementService } from '../../customer-settlement/customer-settlement.service';
import { CustomerSettlement } from '../../customer-settlement/customer-settlement.model';
import { IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-customer-payment-form',
  standalone: true,
  imports: [IonContent, 
    CommonModule,
    ReactiveFormsModule,
    DecimalPipe,
  ],
  templateUrl: './customer-payment-form.component.html',
})
export class CustomerPaymentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CustomerPaymentFormComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);

  private readonly paymentService = inject(CustomerPaymentService);
  private readonly customerSettlementService = inject(CustomerSettlementService);

  readonly settlements = signal<CustomerSettlement[]>([]);
  readonly selectedSettlement = signal<CustomerSettlement | undefined>(undefined);

  readonly amountPaid = signal(0);

  readonly remainingBalance = computed(() => {
    const settlement = this.selectedSettlement();

    if (!settlement) {
      return 0;
    }

    return Math.max(
      settlement.balance - this.amountPaid(),
      0
    );
  });

  readonly paymentStatus = computed(() => {
    const settlement = this.selectedSettlement();
    const amount = this.amountPaid();

    if (!settlement || amount <= 0) {
      return 'pending';
    }

    if (amount >= settlement.balance) {
      return 'paid';
    }

    return 'partially-paid';
  });

  readonly form = this.fb.nonNullable.group({
    settlementId: ['', Validators.required],
    amountPaid: [
      0,
      [
        Validators.required,
        Validators.min(1),
      ],
    ],
    paymentMethod: ['cash' as 'cash' | 'transfer' | 'pos', Validators.required],
    paymentDate: [
      new Date().toISOString().split('T')[0],
      Validators.required,
    ],
    reference: [''],
    notes: [''],
  });

  constructor() {
    this.loadSettlements();

    this.form.controls.settlementId.valueChanges.subscribe((id) => {
      const settlement = this.settlements().find(
        (item) => item.id === id
      );

      this.selectedSettlement.set(settlement);
      this.amountPaid.set(0);
      this.form.controls.amountPaid.setValue(0);
    });

    this.form.controls.amountPaid.valueChanges.subscribe((value) => {
      this.amountPaid.set(Number(value) || 0);
    });
  }

  private loadSettlements(): void {
    this.customerSettlementService.getAll().subscribe({
      next: (settlements) => {
        const unpaidSettlements = settlements.filter(
          (settlement) => settlement.balance > 0
        );

        this.settlements.set(unpaidSettlements);
      },
    });
  }

  async save(): Promise<void> {
  // 1. Validate form
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  // 2. Get form values and selected settlement
  const values = this.form.getRawValue();
  const settlement = this.selectedSettlement();

  if (!settlement) {
    alert('Please select a customer settlement.');
    return;
  }

  // 3. Convert payment amount to number
  const amount = Number(values.amountPaid);

  // 4. Validate payment amount
  if (amount <= 0) {
    alert('Enter a valid payment amount.');
    return;
  }

  // 5. Prevent overpayment
  if (amount > settlement.balance) {
    alert(
      `Payment cannot exceed the outstanding balance of ₦${settlement.balance.toLocaleString()}`
    );
    return;
  }

  // 6. Calculate new balance
  const balance = settlement.balance - amount;

  // 7. Determine payment status
  const status: 'pending' | 'partially-paid' | 'paid' =
    balance === 0
      ? 'paid'
      : 'partially-paid';

  try {
    // 8. Create payment record
    await this.paymentService.create({
      settlementId: settlement.id,
      customerId: settlement.customerId,
      customerName: settlement.customerName,

      settlementAmount: settlement.totalAmount,
      amountPaid: amount,
      balance,

      paymentMethod: values.paymentMethod,

      paymentDate: values.paymentDate,
      reference: values.reference || undefined,
      notes: values.notes || undefined,

      status,
    });

    // 9. Update the original settlement
    await this.customerSettlementService.updatePayment(
      settlement.id,
      settlement.amountPaid + amount,
      balance,
      status
    );

    // 10. Close the modal
    this.dialogRef.close(true);

  } catch (error) {
    console.error('Failed to save payment:', error);
    alert('Failed to save payment.');
  }
}

  close(): void {
    this.dialogRef.close();
  }
}