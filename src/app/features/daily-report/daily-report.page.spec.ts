import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyReportPage } from './daily-report.page';

describe('DailyReportPage', () => {
  let component: DailyReportPage;
  let fixture: ComponentFixture<DailyReportPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
