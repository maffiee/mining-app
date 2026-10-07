export interface MineralProcessing {
  id: string;

  intakeId: string;

  customerId: string;
  customerName: string;

  inputMaterial: string;
  inputQuantity: number;
  inputUnit: string;

  monaziteQuantity: number;
  ironQuantity: number;
  zirconQuantity: number;

  date: string;
  notes?: string;

  status: 'processing' | 'completed';
  createdAt?: any;
}