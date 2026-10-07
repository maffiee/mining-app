import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyRevenuePage } from './company-revenue.page';

describe('CompanyRevenuePage', () => {
  let component: CompanyRevenuePage;
  let fixture: ComponentFixture<CompanyRevenuePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyRevenuePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
