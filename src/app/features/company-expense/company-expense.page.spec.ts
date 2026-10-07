import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyExpensePage } from './company-expense.page';

describe('CompanyExpensePage', () => {
  let component: CompanyExpensePage;
  let fixture: ComponentFixture<CompanyExpensePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyExpensePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
