import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MineralListService, Minerals } from '../../mineral-list/mineral-list.service';
import { LocationService, LocationModel } from '../../location/location.service';
import { MineralPricingService, MineralPricing } from '../mineral-pricing.service';

@Component({
  selector: 'app-mineral-pricing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mineral-pricing-form.component.html'
})
export class MineralPricingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pricingService = inject(MineralPricingService);
  private mineralService = inject(MineralListService);
  private locationService = inject(LocationService);
  private dialogRef = inject(MatDialogRef<MineralPricingFormComponent>);
  public data = inject(MAT_DIALOG_DATA) as { pricing?: MineralPricing } | null;

  form: FormGroup;
  minerals: Minerals[] = [];
  locations: LocationModel[] = [];
  loading = false;
  isEdit = false;
  loadingData = true;

  constructor() {
    // MUST be here, not in ngOnInit
    this.form = this.fb.group({
      mineralId: ['', Validators.required],
      locationId: ['', Validators.required],
      lowPrice: [null, [Validators.required, Validators.min(0)]],
      mediumPrice: [null, [Validators.required, Validators.min(0)]],
      highPrice: [null, [Validators.required, Validators.min(0)]],
    });
  }

  async ngOnInit(){
    this.isEdit = !!this.data?.pricing;
    try {
      this.minerals = await this.mineralService.getAll();
      this.locations = await this.locationService.getAll();

      if(this.isEdit && this.data?.pricing){
        this.form.patchValue({
          mineralId: this.data.pricing.mineralId,
          locationId: this.data.pricing.locationId,
          lowPrice: this.data.pricing.lowPrice,
          mediumPrice: this.data.pricing.mediumPrice,
          highPrice: this.data.pricing.highPrice,
        });
      }
    } catch(e){
      console.error(e);
    } finally {
      this.loadingData = false;
    }
  }

  async save(){
    console.log('SAVE CLICKED', this.form.value, 'valid:', this.form.valid);
    if(this.form.invalid){ 
      this.form.markAllAsTouched(); 
      alert('Please fill all fields');
      return; 
    }
    this.loading = true;
    try {
      const val = this.form.value;
      const mineral = this.minerals.find(m => m.id===val.mineralId);
      const location = this.locations.find(l => l.id===val.locationId);
      
      if(!mineral || !location){
        alert('Mineral or Location not found');
        this.loading = false;
        return;
      }

      const payload = {
        mineralId: val.mineralId,
        mineralName: mineral.name,
        locationId: val.locationId,
        locationName: location.name,
        lowPrice: Number(val.lowPrice),
        mediumPrice: Number(val.mediumPrice),
        highPrice: Number(val.highPrice),
      };

      if(this.isEdit){
        await this.pricingService.update(this.data!.pricing!.id!, payload);
      } else {
        await this.pricingService.create(payload);
      }
      this.dialogRef.close({ reload: true });
    } catch(e:any){ 
      console.error(e);
      alert(e.message); 
    }
    this.loading = false;
  }
  
  close(){ this.dialogRef.close(); }
}