export interface CustomerSettlement {
  id: string;

  processingId: string;

  customerId: string;
  customerName: string;

  monaziteKg: number;
  zirconKg: number;
  ironKg: number;

  monazitePricePerKg: number;
  zirconPricePerKg: number;
  ironPricePerKg: number;

  monaziteAmount: number;
  zirconAmount: number;
  ironAmount: number;

  totalAmount: number;

  amountPaid: number;
  balance: number;

  status: 'pending' | 'partially-paid' | 'paid';

  createdAt?: any;
}