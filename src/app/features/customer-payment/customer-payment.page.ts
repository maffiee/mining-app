import { Component, computed, inject, signal } from '@angular/core';

import { IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomerPaymentService } from './customer-payment.service';
import { CustomerPaymentFormComponent } from './customer-payment-form/customer-payment-form.component';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-customer-payment-list',
  standalone: true,
  imports: [
    IonContent,
    FormsModule, DecimalPipe, DatePipe
  ],
  templateUrl: './customer-payment.page.html',
})
export class CustomerPaymentPage {

  private readonly service =
    inject(CustomerPaymentService);

  private readonly dialog =
    inject(MatDialog);

  readonly payments = toSignal(
    this.service.getAll(),
    {
      initialValue: [],
    }
  );

  readonly searchTerm = signal('');

  readonly filteredPayments = computed(() => {

    const search =
      this.searchTerm()
        .trim()
        .toLowerCase();

    if (!search) {
      return this.payments();
    }

    return this.payments().filter(
      payment =>
        payment.customerName
          .toLowerCase()
          .includes(search)
    );

  });

  openAddPayment(): void {

    this.dialog.open(
      CustomerPaymentFormComponent,
      {
        width: '650px',
        maxWidth: '95vw',
      }
    );

  }

}