import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MineralListPage } from './mineral-list.page';

describe('MineralListPage', () => {
  let component: MineralListPage;
  let fixture: ComponentFixture<MineralListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MineralListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
