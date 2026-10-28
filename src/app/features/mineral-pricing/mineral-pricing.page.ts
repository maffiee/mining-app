import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { MatDialog } from '@angular/material/dialog';
import { MineralPricingService, MineralPricing } from './mineral-pricing.service';
import { MineralPricingFormComponent } from './mineral-pricing-form/mineral-pricing-form.component';

@Component({
  selector: 'app-mineral-pricing',
  templateUrl: './mineral-pricing.page.html',
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class MineralPricingPage implements OnInit {
  private service = inject(MineralPricingService);
  private dialog = inject(MatDialog);

  pricings: MineralPricing[] = [];
  filtered: MineralPricing[] = [];
  search = '';
  loading = true;

  async ngOnInit(){ await this.load(); }

  async load(){
    this.loading = true;
    try {
      this.pricings = await this.service.getAll();
      this.filtered = [...this.pricings];
    } catch(e){ console.error(e); }
    this.loading = false;
  }

  filter(){
    const t = (this.search || '').toLowerCase().trim();
    if(!t){ this.filtered=[...this.pricings]; return; }
    this.filtered = this.pricings.filter(p => 
      (p.mineralName || '').toLowerCase().includes(t) || (p.locationName || '').toLowerCase().includes(t)
    );
  }

  openForm(){
    const ref = this.dialog.open(MineralPricingFormComponent, { width: '500px', data: null });
    ref.afterClosed().subscribe(r => { if(r?.reload) this.load(); });
  }

  editForm(p: MineralPricing){
    const ref = this.dialog.open(MineralPricingFormComponent, { width: '500px', data: { pricing: p } });
    ref.afterClosed().subscribe(r => { if(r?.reload) this.load(); });
  }

  async deletePricing(id: string){
    if(!confirm('Delete this pricing?')) return;
    await this.service.delete(id);
    await this.load();
  }
}