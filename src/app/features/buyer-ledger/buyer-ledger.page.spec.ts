import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuyerLedgerPage } from './buyer-ledger.page';

describe('BuyerLedgerPage', () => {
  let component: BuyerLedgerPage;
  let fixture: ComponentFixture<BuyerLedgerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerLedgerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
