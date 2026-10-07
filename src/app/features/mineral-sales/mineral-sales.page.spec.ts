import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MineralSalesPage } from './mineral-sales.page';

describe('MineralSalesPage', () => {
  let component: MineralSalesPage;
  let fixture: ComponentFixture<MineralSalesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MineralSalesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
