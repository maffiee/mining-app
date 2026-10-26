import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { BuyerService } from '../../core/services/buyer.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { WhatsappService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-buyer-ledger',
  standalone: true,
  imports: [IonToolbar, IonHeader, CommonModule, IonContent, DecimalPipe],
  templateUrl: './buyer-ledger.page.html'
})
export class BuyerLedgerPage {
  private buyerService = inject(BuyerService);
  private whatsapp = inject(WhatsappService);

  buyers = toSignal(this.buyerService.getAll(), { initialValue: [] as any[] });
  ledgers = toSignal(this.buyerService.getAllLedgers(), { initialValue: [] as any[] });

  totalDebt = computed(() => this.buyers().reduce((s: number, b: any) => s + (b.balance > 0 ? b.balance : 0), 0));
  debtors = computed(() => this.buyers().filter((b: any) => b.balance > 0).sort((a: any,b: any) => b.balance - a.balance));

  remindDebtor(buyer: any) {
    const msg = `Hello ${buyer.name}, this is JOS BREED MINING. Your outstanding balance is ₦${buyer.balance}. You bought ${buyer.totalBoughtKg}kg total. Please arrange payment. Thank you.`;
    this.whatsapp.openWhatsApp(buyer.phone, msg);
  }

  async collectPayment(buyer: any, amount: number) {
    // You can build a small form to collect
    alert(`Collect ₦${amount} from ${buyer.name} - Implement payment form`);
  }
}