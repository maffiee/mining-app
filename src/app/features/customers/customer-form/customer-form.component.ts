import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule  } from '@angular/forms';
import { CustomerService } from '../customer.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent  implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CustomerFormComponent>);

  public data = inject<any | null>(MAT_DIALOG_DATA);


  readonly customerForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    address: [''],
  });

  loading = false;
  errorMessage = '';

   // Tells the HTML whether we are editing
  get isEditMode(): boolean {
    return !!this.data;
  }

   ngOnInit(): void {

    // If customer was passed into the dialog,
    // populate the form with existing data.

    if (this.data) {

      this.customerForm.patchValue({
        name: this.data.name,
        phone: this.data.phone,
        address: this.data.address ?? '',
      });

    }
  }


  close(): void{
    this.dialogRef.close();
  }


  async save(): Promise<void> {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';

    try {
      const customer = this.customerForm.getRawValue();

      //Edit
      if (this.data) {
        await this.customerService.updateCustomer(this.data.id, customer);
        this.customerForm.reset();
        this.dialogRef.close();
        return;
      }
      const id = await this.customerService.createCustomer(customer);
      this.customerForm.reset();
      this.dialogRef.close();
    } catch (error) {
      this.errorMessage = this.isEditMode ? 'Unable to update customer.' : 'Unable to create customer.';
    } finally {
      this.loading = false;
    }
  }



  

}
