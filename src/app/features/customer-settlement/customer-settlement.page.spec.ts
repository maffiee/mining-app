import { signal } from '@angular/core';
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

  it('should not mark partially paid settlements as fully paid', () => {
    (component as any).settlements = signal([
      {
        id: 'partial-1',
        customerName: 'Jane Doe',
        status: 'partially-paid',
        balance: 5000,
      },
      {
        id: 'paid-1',
        customerName: 'John Doe',
        status: 'paid',
        balance: 0,
      },
    ]);

    expect(component.isSettlementPaid('partial-1')).toBeFalse();
    expect(component.isSettlementPaid('paid-1')).toBeTrue();
  });
});
