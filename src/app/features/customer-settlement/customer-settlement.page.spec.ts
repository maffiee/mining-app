import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerSettlementPage } from './customer-settlement.page';

describe('CustomerSettlementPage', () => {
  let component: CustomerSettlementPage;
  let fixture: ComponentFixture<CustomerSettlementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSettlementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
