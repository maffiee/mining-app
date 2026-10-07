export interface MaterialIntake {
  id: string;
  customerId: string;
  customerName: string;
  materialType: string;
  quantity: number;
  unit: string;
  date: string;
  notes?: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt?: any;
}