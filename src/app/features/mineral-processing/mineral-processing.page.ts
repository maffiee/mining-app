import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';

import { MineralProcessingService } from './mineral-processing-service';
import { MineralProcessingFormComponent } from './mineral-processing-form/mineral-processing-form.component';

@Component({
  selector: 'app-mineral-processing-list',
  standalone: true,
  imports: [
    IonContent,
    FormsModule,
  ],
  templateUrl: './mineral-processing.page.html',
})
export class MineralProcessingPage {

  private readonly service = inject(MineralProcessingService);
  private readonly dialog = inject(MatDialog);

  readonly records = toSignal(
    this.service.getAll(),
    {
      initialValue: [],
    }
  );

  readonly searchTerm = signal('');

  readonly filteredRecords = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) { return this.records();}

    return this.records().filter(record =>
      record.customerName.toLowerCase().includes(search)
      || record.inputMaterial.toLowerCase().includes(search)
    );
  });


  openAddProcessing(): void {
    this.dialog.open(
      MineralProcessingFormComponent,
      {
        width: '650px',
        maxWidth: '95vw',
      }
    );
  }
}