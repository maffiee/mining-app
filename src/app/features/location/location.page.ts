import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { MatDialog } from '@angular/material/dialog';
import { LocationService, LocationModel } from './location.service';
import { LocationFormComponent } from './location-form/location-form.component';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  standalone: true,
  imports: [IonHeader, IonContent, CommonModule, FormsModule]
})
export class LocationPage implements OnInit {
  private service = inject(LocationService);
  private dialog = inject(MatDialog);

  locations: LocationModel[] = [];
  filteredLocations: LocationModel[] = [];
  searchTerm = '';
  loading = true;

  async ngOnInit() { await this.getAll(); }

  async getAll() {
    this.loading = true;
    try {
      this.locations = await this.service.getAll();
      this.filteredLocations = [...this.locations];
    } catch (e) { console.error(e); }
    this.loading = false;
  }

  filterLocations() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) { this.filteredLocations = [...this.locations]; return; }
    this.filteredLocations = this.locations.filter(l => l.name.toLowerCase().includes(term));
  }

  openForm() {
    const ref = this.dialog.open(LocationFormComponent, { width: '450px', data: null });
    ref.afterClosed().subscribe(r => { if(r?.reload) this.getAll(); });
  }

  editForm(loc: LocationModel) {
    const ref = this.dialog.open(LocationFormComponent, { width: '450px', data: { location: loc } });
    ref.afterClosed().subscribe(r => { if(r?.reload) this.getAll(); });
  }

  async toggleActive(loc: LocationModel) {
    try {
      await this.service.toggleActive(loc.id!, !(loc.isActive!==false));
      await this.getAll();
    } catch(e:any){ alert(e.message); }
  }

  async deleteLocation(id: string) {
    if(!confirm('Delete this location?')) return;
    try { await this.service.delete(id); await this.getAll(); } catch(e:any){ alert(e.message); }
  }
}