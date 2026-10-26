import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MineralSalesPage } from './mineral-sales.page';
import { MineralSaleService } from './mineral-sale.service';

describe('MineralSalesPage', () => {
  let component: MineralSalesPage;
  let fixture: ComponentFixture<MineralSalesPage>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [MineralSalesPage],
      providers: [
        { provide: MineralSaleService, useValue: { getAll: () => of([]) } },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MineralSalesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the sales form in edit mode when the row edit button is clicked', () => {
    const sale = {
      id: 'sale-1',
      buyerName: 'Amina',
      buyerLocation: 'Kano',
      mineralType: 'zircon',
      quantity: 50,
      unitPrice: 200,
      totalAmount: 10000,
      saleDate: '2026-10-12',
    };

    component.editSale(sale as any);

    expect(dialog.open).toHaveBeenCalled();
    expect(dialog.open.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({
      data: sale,
      width: '650px',
      maxWidth: '95vw',
    }));
  });
});
