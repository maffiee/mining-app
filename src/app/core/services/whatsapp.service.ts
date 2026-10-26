import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly OWNER_PHONE = '2347062233259'; // Jos Breed Owner - 07062233259

  private formatPhone(phone: string): string {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '234' + p.substring(1);
    if (!p.startsWith('234') && p.length === 10) p = '234' + p;
    if (!p.startsWith('234')) p = '234' + p;
    return p;
  }

  // Buyer receipt - clean, professional for Chinese buyers
  getBuyerReceiptMessage(sale: any, receiptNo: string, debt: number): string {
    const paid = sale.paidAmount ?? sale.totalAmount;
    return `*JOS BREED MINING LTD*\n`+
      `_TIN MINING & MINERAL PROCESSING_\n`+
      `Bukuru, Jos - Plateau State\n`+
      `--------------------------------\n`+
      `*SALES RECEIPT*\n\n`+
      `Receipt No: ${receiptNo}\n`+
      `Date: ${sale.saleDate} | ${new Date().toLocaleTimeString()}\n\n`+
      `Buyer: ${sale.buyerName}\n`+
      `Location: ${sale.buyerLocation}\n`+
      `Phone: ${sale.buyerPhone || '-'}\n\n`+
      `--------------------------------\n`+
      `Item: ${String(sale.mineralType).toUpperCase()} - ${sale.quantity}kg\n`+
      `Unit: ₦${Number(sale.unitPrice).toLocaleString()}/kg\n`+
      `*Total: ₦${Number(sale.totalAmount).toLocaleString()}*\n`+
      `Paid: ₦${Number(paid).toLocaleString()}\n`+
      `${debt>0?`*BALANCE OWED: ₦${Number(debt).toLocaleString()}*\n`:''}`+
      `--------------------------------\n\n`+
      `${debt>0?'⚠️ Please pay balance soon.\n\n':''}`+
      `Thank you for patronage!\n`+
      `For enquiries: 07062233259`;
  }

  // Owner receipt - shows everything owner needs to audit
  getOwnerReceiptMessage(sale: any, receiptNo: string, buyerPhone: string, debt: number, staff: string): string {
    const paid = sale.paidAmount ?? sale.totalAmount;
    return `*🔔 NEW SALE ALERT*\n`+
      `*JOS BREED MINING*\n\n`+
      `Receipt: ${receiptNo}\n`+
      `Staff: ${staff}\n`+
      `Time: ${new Date().toLocaleString()}\n\n`+
      `--------------------------------\n`+
      `Buyer: ${sale.buyerName}\n`+
      `Phone: ${buyerPhone}\n`+
      `Location: ${sale.buyerLocation}\n\n`+
      `Item: ${String(sale.mineralType).toUpperCase()}\n`+
      `Qty: ${sale.quantity}kg @ ₦${Number(sale.unitPrice).toLocaleString()}\n`+
      `Total: ₦${Number(sale.totalAmount).toLocaleString()}\n`+
      `Paid: ₦${Number(paid).toLocaleString()}\n`+
      `${debt>0?`⚠️ *DEBT: ₦${Number(debt).toLocaleString()} - ${sale.buyerName} OWES YOU!*\n`: `✅ Fully Paid\n`}`+
      `--------------------------------\n`+
      `Check Dashboard for Stock Left\n`+
      `Buyer Ledger Updated.`;
  }

  openWhatsApp(phone: string, message: string) {
    if (!phone) return;
    const formatted = this.formatPhone(phone);
    const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  async sendToBuyerAndOwner(sale: any, buyerPhone: string, staffEmail: string, debt: number) {
    const ownerPhone = this.OWNER_PHONE;
    const receiptNo = `REC-${(sale.id || '000000').substring(0,6).toUpperCase()}-${new Date().getFullYear()}`;
    
    const buyerMsg = this.getBuyerReceiptMessage(sale, receiptNo, debt);
    const ownerMsg = this.getOwnerReceiptMessage(sale, receiptNo, buyerPhone, debt, staffEmail);

    // Open buyer first
    this.openWhatsApp(buyerPhone, buyerMsg);

    // After 1.5 sec, open owner (you)
    setTimeout(() => {
      this.openWhatsApp(ownerPhone, ownerMsg);
    }, 1500);
  }

  // For ledger reminder
  sendDebtReminder(buyerPhone: string, buyerName: string, balance: number) {
    const msg = `Hello ${buyerName},\n\nThis is *JOS BREED MINING LTD*.\n\nYour outstanding balance is *₦${Number(balance).toLocaleString()}*.\n\nPlease arrange payment at your earliest convenience.\n\nFor payment confirmation, reply to this message or call 07062233259.\n\nThank you.`;
    this.openWhatsApp(buyerPhone, msg);
  }
}