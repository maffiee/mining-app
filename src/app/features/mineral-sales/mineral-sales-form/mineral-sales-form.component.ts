import { Component, inject, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { MineralInventoryService } from '../../mineral-inventory/mineral-inventory.service';
import { MineralSaleService } from '../mineral-sale.service';
import { DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-mineral-sale-form',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, CommonModule],
  templateUrl: './mineral-sales-form.component.html',
})
export class MineralSaleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly saleService = inject(MineralSaleService);
  private readonly inventoryService = inject(MineralInventoryService);
  private readonly dialogRef = inject(MatDialogRef<MineralSaleFormComponent>);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as any;

  readonly inventory = toSignal(this.inventoryService.getAll(), { initialValue: [] });

  loading = false;
  errorMessage = '';
  isEdit = false;

  readonly form = this.fb.nonNullable.group({
    buyerName: ['', Validators.required],
    buyerLocation: ['', Validators.required],
    buyerPhone: ['', [Validators.required, Validators.minLength(10)]],
    mineralType: ['monazite' as const, Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    unitPrice: [0, [Validators.required, Validators.min(1)]],
    paidAmount: [0, [Validators.required, Validators.min(0)]],
    saleDate: [new Date().toISOString().split('T')[0], Validators.required],
    notes: [''],
  });

  ngOnInit(): void {
    if (this.data?.id) {
      this.isEdit = true;
      this.form.patchValue({
        buyerName: this.data.buyerName ?? '',
        buyerLocation: this.data.buyerLocation ?? '',
        buyerPhone: this.data.buyerPhone ?? '',
        mineralType: this.data.mineralType ?? 'monazite',
        quantity: Number(this.data.quantity ?? 0),
        unitPrice: Number(this.data.unitPrice ?? 0),
        paidAmount: Number(this.data.paidAmount ?? this.data.totalAmount ?? 0),
        saleDate: this.data.saleDate?.split('T')[0] ?? this.data.saleDate ?? new Date().toISOString().split('T')[0],
        notes: this.data.notes ?? '',
      });
    } else {
      this.form.controls.quantity.valueChanges.subscribe(() => this.autoFillPaid());
      this.form.controls.unitPrice.valueChanges.subscribe(() => this.autoFillPaid());
    }
  }

  private autoFillPaid() {
    if (!this.isEdit) {
      this.form.controls.paidAmount.setValue(this.totalAmount(), { emitEvent: false });
    }
  }

  private readonly formValues = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  readonly totalAmount = computed(() => {
    const v = this.formValues();
    return Number(v.quantity || 0) * Number(v.unitPrice || 0);
  });

  readonly debtAmount = computed(() => {
    const v = this.formValues();
    return this.totalAmount() - Number(v.paidAmount || 0);
  });

  readonly availableStock = computed(() => {
    const type = this.formValues().mineralType;
    return this.inventory().find(i => i.mineralType === type)?.totalQuantity ?? 0;
  });

  close() { this.dialogRef.close(); }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const oldQty = this.isEdit ? Number(this.data.quantity ?? 0) : 0;

    if (v.quantity > oldQty) {
      const needed = v.quantity - oldQty;
      if (needed > this.availableStock()) {
        this.errorMessage = `Insufficient stock. You need ${needed}kg more, but only ${this.availableStock()}kg available.`;
        return;
      }
    }

    if (v.paidAmount > this.totalAmount()) {
      this.errorMessage = `Paid amount cannot be more than total ₦${this.totalAmount()}`;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    try {
      const payload: any = {
        buyerName: v.buyerName,
        buyerLocation: v.buyerLocation,
        buyerPhone: v.buyerPhone,
        mineralType: v.mineralType,
        quantity: v.quantity,
        unitPrice: v.unitPrice,
        totalAmount: this.totalAmount(),
        paidAmount: v.paidAmount,
        debt: this.debtAmount(),
        saleDate: v.saleDate,
        notes: v.notes,
      };

      if (this.isEdit && this.data?.id) {
        await this.saleService.update(this.data.id, payload);
      } else {
        await this.saleService.create(payload);
        // WhatsApp handled inside service only - no duplicate
      }

      this.dialogRef.close(true);
    } catch (e) {
      console.error(e);
      this.errorMessage = (e as Error).message || 'Failed to save sale.';
    } finally { 
      this.loading = false; 
    }
  }
}