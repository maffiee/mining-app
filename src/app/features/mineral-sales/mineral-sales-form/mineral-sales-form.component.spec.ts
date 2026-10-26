import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MineralSaleFormComponent } from './mineral-sales-form.component';

describe('MineralSaleFormComponent', () => {
  let component: MineralSaleFormComponent;
  let fixture: ComponentFixture<MineralSaleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MineralSaleFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MineralSaleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
