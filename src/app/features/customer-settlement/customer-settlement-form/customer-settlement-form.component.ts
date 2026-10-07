import { Component, computed, inject, signal } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDialogRef } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { MineralProcessingService } from '../../mineral-processing/mineral-processing-service';
import { CustomerSettlementService } from '../customer-settlement.service';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-customer-settlement-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, DecimalPipe
  ],

  templateUrl: './customer-settlement-form.component.html',
})
export class CustomerSettlementFormComponent {

  readonly monazitePrice = signal(0);
  readonly zirconPrice = signal(0);
  readonly ironPrice = signal(0);

  private readonly fb = inject(FormBuilder);

  private readonly processingService =
    inject(MineralProcessingService);

  private readonly settlementService =
    inject(CustomerSettlementService);

  private readonly dialogRef =
    inject(MatDialogRef<CustomerSettlementFormComponent>);


    onMonazitePriceChange(value: string): void {
  this.monazitePrice.set(Number(value) || 0);
}

onZirconPriceChange(value: string): void {
  this.zirconPrice.set(Number(value) || 0);
}

onIronPriceChange(value: string): void {
  this.ironPrice.set(Number(value) || 0);
}


  readonly processingRecords = toSignal(
    this.processingService.getAll(),
    {
      initialValue: [],
    }
  );

  readonly settlements = toSignal(
  this.settlementService.getAll(),
  {
    initialValue: [],
  }
);

  readonly selectedProcessingId =
    signal('');


  readonly selectedProcessing = computed(() => {

    const id = this.selectedProcessingId();

    return this.processingRecords().find(
      record => record.id === id
    );

  });


  loading = false;

  errorMessage = '';


  readonly form = this.fb.nonNullable.group({

    processingId: [
      '',
      Validators.required,
    ],

    monazitePricePerKg: [
      0,
      [
        Validators.required,
        Validators.min(0),
      ],
    ],

    zirconPricePerKg: [
      0,
      [
        Validators.required,
        Validators.min(0),
      ],
    ],

    ironPricePerKg: [
      0,
      [
        Validators.required,
        Validators.min(0),
      ],
    ],

  });


  readonly amounts = computed(() => {

  const processing = this.selectedProcessing();

  if (!processing) {
    return {
      monazite: 0,
      zircon: 0,
      iron: 0,
      total: 0,
    };
  }

  const monazite =
    processing.monaziteQuantity *
    this.monazitePrice();

  const zircon =
    processing.zirconQuantity *
    this.zirconPrice();

  const iron =
    processing.ironQuantity *
    this.ironPrice();

  return {
    monazite,
    zircon,
    iron,
    total: monazite + zircon + iron,
  };
});


  selectProcessing(id: string): void {

    this.selectedProcessingId.set(id);

    this.form.controls.processingId.setValue(id);
  }


  close(): void {
    this.dialogRef.close();
  }

  readonly unsettledProcessingRecords = computed(() => {
  const settledProcessingIds = new Set(
    this.settlements().map(settlement => settlement.processingId)
  );

  return this.processingRecords().filter(
    record => !settledProcessingIds.has(record.id)
  );
});


  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const processing =
      this.selectedProcessing();
    if (!processing) {
      this.errorMessage =
        'Please select a processing record.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    try {
      const values =
        this.form.getRawValue();

      const calculated =
        this.amounts();

      await this.settlementService.create({
        processingId: processing.id,
        customerId: processing.customerId,
        customerName: processing.customerName,
        monaziteKg:
          processing.monaziteQuantity,
        zirconKg:
          processing.zirconQuantity,
        ironKg:
          processing.ironQuantity,
        monazitePricePerKg:
          values.monazitePricePerKg,
        zirconPricePerKg:
          values.zirconPricePerKg,
        ironPricePerKg:
          values.ironPricePerKg,
        monaziteAmount:
          calculated.monazite,
        zirconAmount:
          calculated.zircon,
        ironAmount:
          calculated.iron,
        totalAmount:
          calculated.total,
        amountPaid: 0,
        balance:
          calculated.total,
        status: 'pending',
      });

      this.dialogRef.close(true);

    } catch (error) {
      console.error(
        'Settlement error:',
        error
      );
      this.errorMessage =
        'Unable to create customer settlement.';
    } finally {
      this.loading = false;
    }
  }
}