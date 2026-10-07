import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MineralInventoryPage } from './mineral-inventory.page';

describe('MineralInventoryPage', () => {
  let component: MineralInventoryPage;
  let fixture: ComponentFixture<MineralInventoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MineralInventoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
