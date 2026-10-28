import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocationService, LocationModel } from '../location.service';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-form.component.html'
})
export class LocationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(LocationService);
  private dialogRef = inject(MatDialogRef<LocationFormComponent>);
  public data = inject(MAT_DIALOG_DATA) as { location?: LocationModel } | null;

  form!: FormGroup;
  isEditMode = false;
  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.isEditMode = !!this.data?.location;
    this.form = this.fb.group({
      name: [this.data?.location?.name || '', [Validators.required, Validators.minLength(2)]],
      isActive: [this.data?.location?.isActive ?? true]
    });
  }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';
    try {
      if (this.isEditMode) {
        await this.service.update(this.data!.location!.id!, this.form.value);
      } else {
        await this.service.create(this.form.value.name);
      }
      this.dialogRef.close({ reload: true });
    } catch (e: any) {
      this.errorMessage = e.message;
    }
    this.loading = false;
  }
  close() { this.dialogRef.close(); }
}