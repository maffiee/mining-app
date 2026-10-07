import { Component, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { MineralInventoryService } from '../../mineral-inventory/mineral-inventory.service';
import { MineralSaleService } from '../mineral-sale.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-mineral-sale-form',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './mineral-sales-form.component.html',
})
export class MineralSaleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly saleService = inject(MineralSaleService);
  private readonly inventoryService = inject(MineralInventoryService);
  private readonly dialogRef = inject(MatDialogRef<MineralSaleFormComponent>);

  readonly inventory = toSignal(this.inventoryService.getAll(), { initialValue: [] });

  loading = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    buyerName: ['', Validators.required],
    buyerLocation: ['', Validators.required],
    mineralType: ['monazite' as const, Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    unitPrice: [0, [Validators.required, Validators.min(1)]],
    transportationCost: [0, [Validators.required, Validators.min(0)]],
    saleDate: [new Date().toISOString().split('T')[0], Validators.required],
    notes: [''],
  });

  // FIX: Make form reactive to signals
  private readonly formValues = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  readonly totalAmount = computed(() => {
    const v = this.formValues();
    return Number(v.quantity || 0) * Number(v.unitPrice || 0);
  });

  readonly netAmount = computed(() => {
    return this.totalAmount() - Number(this.formValues().transportationCost || 0);
  });

  readonly availableStock = computed(() => {
    const type = this.formValues().mineralType;
    return this.inventory().find(i => i.mineralType === type)?.totalQuantity?? 0;
  });

  close() { this.dialogRef.close(); }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    if (v.quantity > this.availableStock()) {
      this.errorMessage = `Insufficient stock. Available: ${this.availableStock()} kg`;
      return;
    }

    this.loading = true;
    try {
      await this.saleService.create({
        buyerName: v.buyerName,
        buyerLocation: v.buyerLocation,
        mineralType: v.mineralType,
        quantity: v.quantity,
        unitPrice: v.unitPrice,
        totalAmount: this.totalAmount(),
        transportationCost: v.transportationCost,
        netAmount: this.netAmount(),
        saleDate: v.saleDate,
        notes: v.notes,
      });
      this.dialogRef.close(true);
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Failed to create sale. Check stock.';
    } finally { this.loading = false; }
  }
}