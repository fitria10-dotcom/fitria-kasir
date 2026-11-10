export type ProductCategory = 
  | 'Semua'
  | 'Makanan'
  | 'Minuman'
  | 'Snack'
  | 'Dessert'
  | 'Alacarte'
  | 'Super Deal';

export interface ModifierOption {
  name: string;
  price: number;
}

export interface ModifierGroup {
  groupName: string;
  required?: boolean;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  costPrice: number; // HPP
  stock: number;
  minStock: number; // Batas Minimum Stok
  unit: string;
  image: string;
  description?: string;
  modifiers?: ModifierGroup[];
  isAvailable: boolean;
}

export interface CartItemModifier {
  name: string;
  price: number;
  groupName?: string;
}

export interface CartItem {
  id: string; // unique item line id
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedModifiers: CartItemModifier[];
  notes?: string;
  discount: number;
  subtotal: number;
}

export type DiningOption = 'dine_in' | 'takeaway' | 'delivery';

export type PaymentMethod = 
  | 'qris' 
  | 'cash' 
  | 'gopay' 
  | 'ovo' 
  | 'dana' 
  | 'shopeepay' 
  | 'bca_va' 
  | 'mandiri_va' 
  | 'debit_card';

export interface Transaction {
  id: string;
  invoiceNo: string;
  customerName: string;
  diningOption: DiningOption;
  tableNumber?: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  tax: number; // PB1
  rounding: number;
  total: number;
  totalCost: number; // for profit calculation
  paymentMethod: PaymentMethod;
  paymentStatus: 'completed' | 'pending' | 'cancelled';
  cashGiven?: number;
  changeAmount?: number;
  cashierName: string;
  outletName: string;
  createdAt: string; // ISO date
  referenceCode?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  type: 'sale' | 'restock' | 'adjustment_loss' | 'adjustment_audit';
  changeQty: number; // negative for sale/loss, positive for restock
  beforeQty: number;
  afterQty: number;
  notes: string;
  createdAt: string;
  performedBy: string;
}

export interface HoldOrder {
  id: string;
  savedAt: string;
  customerName: string;
  tableNumber?: string;
  diningOption: DiningOption;
  items: CartItem[];
  total: number;
}

export interface StaffAttendance {
  id: string;
  staffName: string;
  role: string;
  clockIn: string;
  clockOut?: string;
  status: 'present' | 'completed';
  notes?: string;
}

export interface CashTransaction {
  id: string;
  type: 'in' | 'out';
  category: string;
  amount: number;
  description: string;
  createdAt: string;
  cashierName: string;
}

export type ActiveTab = 
  | 'kasir'
  | 'riwayat'
  | 'absensi'
  | 'keuangan'
  | 'stok'
  | 'laporan'
  | 'pengaturan';
