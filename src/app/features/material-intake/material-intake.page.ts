import { Component, computed, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { MaterialIntakeFormComponent } from './material-intake-form/material-intake-form.component';
import { MaterialIntakeService } from './material-intake.service';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { CdkObserveContent } from "@angular/cdk/observers";

@Component({
  selector: 'app-material-intake',
  standalone: true,
  imports: [IonContent, FormsModule],
  templateUrl: './material-intake.page.html',
})
export class MaterialIntakePage {
  private readonly materialIntakeService = inject(MaterialIntakeService);
  private readonly dialog = inject(MatDialog);
  readonly materialIntakes = toSignal(this.materialIntakeService.getMaterialIntakes(), {initialValue: []});
  readonly searchTerm = signal('');

  readonly filteredMaterialIntakes = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) { return this.materialIntakes();}

    return this.materialIntakes().filter(materialIntake =>
      materialIntake.customerName.toLowerCase().includes(search) ||
      materialIntake.materialType.toLowerCase().includes(search)
    );
  });

  openMaterialIntakeForm() {
    this.dialog.open(MaterialIntakeFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'material-intake-dialog',
    });
  }

  editMaterialIntakeForm(materialIntake: any) {
    this.dialog.open(MaterialIntakeFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'material-intake-dialog',
      data: materialIntake
    });
  }
}
  