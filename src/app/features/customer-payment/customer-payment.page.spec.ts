import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerPaymentPage } from './customer-payment.page';

describe('CustomerPaymentPage', () => {
  let component: CustomerPaymentPage;
  let fixture: ComponentFixture<CustomerPaymentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
