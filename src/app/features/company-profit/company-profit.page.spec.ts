import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyProfitPage } from './company-profit.page';

describe('CompanyProfitPage', () => {
  let component: CompanyProfitPage;
  let fixture: ComponentFixture<CompanyProfitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyProfitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
