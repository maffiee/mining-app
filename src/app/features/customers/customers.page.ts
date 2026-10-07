import { Component, computed, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { CustomerService } from './customer.service';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { CdkObserveContent } from "@angular/cdk/observers";



@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [IonContent, ReactiveFormsModule, FormsModule, RouterModule, CdkObserveContent],
  templateUrl: './customers.page.html',
})
export class CustomersPage {
  private readonly customerService = inject(CustomerService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  readonly searchTerm = signal('');

  readonly customers = toSignal(this.customerService.getCustomers(),
  {
    initialValue: [],
  });

  readonly filteredCustomers = computed(() => {

    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    if (!search) {
      return this.customers();
    }

    return this.customers().filter(customer =>
      customer.name.toLowerCase().includes(search) ||
      customer.phone.toLowerCase().includes(search)
    );
  });

  openCustomerForm() {
    this.dialog.open(CustomerFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'customer-dialog',
    });
  }

  editCustomerForm(customer: any) {
    this.dialog.open(CustomerFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'customer-dialog',
      data: customer
    });
  }

  
}