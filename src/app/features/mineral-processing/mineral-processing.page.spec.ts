import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MineralProcessingPage } from './mineral-processing.page';

describe('MineralProcessingPage', () => {
  let component: MineralProcessingPage;
  let fixture: ComponentFixture<MineralProcessingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MineralProcessingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
