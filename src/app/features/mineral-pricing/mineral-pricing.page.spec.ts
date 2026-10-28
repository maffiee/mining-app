import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MineralPricingPage } from './mineral-pricing.page';

describe('MineralPricingPage', () => {
  let component: MineralPricingPage;
  let fixture: ComponentFixture<MineralPricingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MineralPricingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
