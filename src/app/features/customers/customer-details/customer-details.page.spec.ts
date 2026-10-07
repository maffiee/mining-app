import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDetailsPage } from './customer-details.page';

describe('CustomerDetailsPage', () => {
  let component: CustomerDetailsPage;
  let fixture: ComponentFixture<CustomerDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
