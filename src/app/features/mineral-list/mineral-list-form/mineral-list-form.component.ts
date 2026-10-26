import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MineralListService, Minerals } from '../mineral-list.service';

@Component({
  selector: 'app-mineral-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mineral-list-form.component.html'
})
export class MineralFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(MineralListService);
  private dialogRef = inject(MatDialogRef<MineralFormComponent>);
  public data = inject(MAT_DIALOG_DATA) as { mineral?: Minerals } | null;

  form!: FormGroup;
  isEditMode = false;
  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.isEditMode = !!this.data?.mineral;
    this.form = this.fb.group({
      name: [this.data?.mineral?.name || '', [Validators.required, Validators.minLength(2)]],
      price: [this.data?.mineral?.price ?? null, [Validators.required, Validators.min(0)]]
    });
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      if (this.isEditMode) {
        await this.service.updateMineral(this.data!.mineral!.id!, this.form.value);
      } else {
        await this.service.createMinerals(this.form.value);
      }
      this.dialogRef.close({ reload: true });
    } catch (e: any) {
      this.errorMessage = e.message;
    }
    this.loading = false;
  }

  close() {
    this.dialogRef.close();
  }
}