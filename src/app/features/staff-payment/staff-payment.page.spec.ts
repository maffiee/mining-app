import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaffPaymentPage } from './staff-payment.page';

describe('StaffPaymentPage', () => {
  let component: StaffPaymentPage;
  let fixture: ComponentFixture<StaffPaymentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffPaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
