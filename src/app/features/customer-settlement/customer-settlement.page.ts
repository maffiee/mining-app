import { Component, computed, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { CustomerSettlementService } from './customer-settlement.service';
import { CustomerSettlementFormComponent } from './customer-settlement-form/customer-settlement-form.component';
import { CustomerPaymentService } from '../customer-payment/customer-payment.service';
import { CustomerPaymentFormComponent } from '../customer-payment/customer-payment-form/customer-payment-form.component';

@Component({
  selector: 'app-customer-settlement-list',
  standalone: true,
  imports: [IonContent, FormsModule, DecimalPipe],
  templateUrl: './customer-settlement.page.html',
})
export class CustomerSettlementPage {
  private readonly settlementService = inject(CustomerSettlementService);
  private readonly customerPaymentService = inject(CustomerPaymentService);
  private readonly dialog = inject(MatDialog);

  // All settlements
  readonly settlements = toSignal(this.settlementService.getAll(), {
    initialValue: [] as any[],
  });

  // All customer payments - THIS IS THE FIX
  readonly payments = toSignal(this.customerPaymentService.getAll(), {
    initialValue: [] as any[],
  });

  readonly searchTerm = signal('');

  // Set of paid settlement IDs - prevents double pay
  readonly paidSettlementIds = computed(
    () => new Set(this.payments().map((p: any) => p.settlementId))
  );

  // Filtered by search
  readonly filteredSettlements = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    if (!search) return this.settlements();
    return this.settlements().filter((settlement: any) =>
      settlement.customerName.toLowerCase().includes(search)
    );
  });

  isSettlementPaid(settlementId: string): boolean {
    return this.paidSettlementIds().has(settlementId);
  }

  openAddSettlement(): void {
    this.dialog.open(CustomerSettlementFormComponent, {
      width: '650px',
      maxWidth: '95vw',
    });
  }

  openPay(settlement: any): void {
    if (this.isSettlementPaid(settlement.id)) {
      alert('This settlement already paid');
      return;
    }

    // Open payment form with settlement data
    this.dialog.open(CustomerPaymentFormComponent, {
      width: '500px',
      data: settlement,
    });
  }
}