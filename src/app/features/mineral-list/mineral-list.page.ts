import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { MatDialog } from '@angular/material/dialog';
import { MineralListService, Minerals } from './mineral-list.service';
import { MineralFormComponent } from './mineral-list-form/mineral-list-form.component';

@Component({
  selector: 'app-mineral-list',
  templateUrl: './mineral-list.page.html',
  styleUrls: ['./mineral-list.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class MineralListPage implements OnInit {
  private service = inject(MineralListService);
  private dialog = inject(MatDialog);

  minerals: Minerals[] = [];
  filteredMinerals: Minerals[] = [];
  searchTerm = '';
  loading = true;

  async ngOnInit() {
    await this.getAll();
  }

  async getAll() {
    this.loading = true;
    try {
      this.minerals = await this.service.getAll();
      this.filteredMinerals = [...this.minerals];
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  }

  filterMinerals() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredMinerals = [...this.minerals];
      return;
    }
    this.filteredMinerals = this.minerals.filter(m =>
      m.name.toLowerCase().includes(term)
    );
  }

  openMineralForm() {
    const dialogRef = this.dialog.open(MineralFormComponent, {
      width: '450px',
      data: null
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.reload) {
        this.getAll();
      }
    });
  }

  editMineralForm(mineral: Minerals) {
    const dialogRef = this.dialog.open(MineralFormComponent, {
      width: '450px',
      data: { mineral }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.reload) {
        this.getAll();
      }
    });
  }

  async deleteMineral(id: string) {
    if (!confirm('Delete this mineral?')) return;
    try {
      await this.service.deleteMineral(id);
      await this.getAll();
    } catch (e: any) {
      alert(e.message);
    }
  }
}