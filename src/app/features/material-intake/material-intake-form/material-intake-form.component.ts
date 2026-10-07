import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule  } from '@angular/forms'; 
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialIntakeService } from '../material-intake.service';
import { MaterialIntake } from '../material-intake.model';
import { CustomerService } from '../../customers/customer.service';
import { Customer } from '../../customers/customer.model';

@Component({
  selector: 'app-material-intake-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './material-intake-form.component.html',
  styleUrls: ['./material-intake-form.component.scss'],
})
export class MaterialIntakeFormComponent  implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly dialogRef = inject(MatDialogRef<MaterialIntakeFormComponent>);
  private readonly materialIntakeService = inject(MaterialIntakeService);

  public data = inject<any | null>(MAT_DIALOG_DATA);
  readonly customerList = signal<Customer[]>([]);

  loading = false;
  errorMessage = '';

  readonly materialIntakeForm = this.fb.nonNullable.group({
    customerName: ['', Validators.required],
    customerId: ['', Validators.required],
    materialType: ['', Validators.required],
    quantity: 0,
    unit: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    notes: [''],
  });

  get isEidiMode(): boolean {
    return !!this.data;
  }

  ngOnInit(): void {
    if (this.data) {
      this.materialIntakeForm.patchValue({
        customerName: this.data.customerName,
        customerId: this.data.customerId,
        materialType: this.data.materialType,
        quantity: Number(this.data.quantity),
        unit: this.data.unit,
        date: this.data.date,
        notes: this.data.notes ?? '',
      });
    }

    this.customerService.getCustomers().subscribe((customers) => {
      this.customerList.set(customers);

      const selectedCustomerId = this.materialIntakeForm.get('customerId')?.value || this.data?.customerId;
      const match = customers.find((customer) => customer.id === selectedCustomerId);

      if (match) {
        this.materialIntakeForm.patchValue({
          customerName: match.name,
          customerId: match.id,
        });
      }
    });
  }

  onCustomerChange(): void {
    const selectedCustomerId = this.materialIntakeForm.get('customerId')?.value;
    const selectedCustomer = this.customerList().find((customer) => customer.id === selectedCustomerId);

    if (selectedCustomer) {
      this.materialIntakeForm.patchValue({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    if (this.materialIntakeForm.invalid) {
      this.materialIntakeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    try {
      const raw = this.materialIntakeForm.getRawValue();

      // map form -> expected API payload and ensure required fields exist
      const payload = {
        ...raw,
        customerId: raw.customerId,
        customerName: raw.customerName,
        quantity: Number(raw.quantity),
        status: this.data?.status ?? 'pending',
      } as Omit<MaterialIntake, 'id' | 'createdAt'>;

      //Edit
      if (this.data) {
        await this.materialIntakeService.updateMaterialIntake(this.data.id, payload);
        this.materialIntakeForm.reset();
        this.dialogRef.close();
        return;
      }
      const id = await this.materialIntakeService.createMaterialIntake(payload);
      this.materialIntakeForm.reset();
      this.dialogRef.close();
    } catch (error) {
      this.errorMessage = this.isEidiMode ? 'Unable to update material intake.' : 'Unable to create material intake.';
    } finally {
      this.loading = false;
    }
    
  }

}
