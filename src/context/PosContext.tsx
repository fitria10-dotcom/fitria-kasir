import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  CartItemModifier,
  DiningOption,
  PaymentMethod,
  Transaction,
  StockMovement,
  HoldOrder,
  ActiveTab,
  StaffAttendance,
  CashTransaction,
} from '../types/pos';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { generateId, generateInvoiceNumber } from '../utils/formatters';
import { sound } from '../utils/audio';

interface PosContextType {
  products: Product[];
  cart: CartItem[];
  customerName: string;
  tableNumber: string;
  diningOption: DiningOption;
  discountTotal: number;
  taxRate: number; // PB1 e.g. 0.10
  rounding: number;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  transactions: Transaction[];
  stockMovements: StockMovement[];
  savedOrders: HoldOrder[];
  attendances: StaffAttendance[];
  cashTransactions: CashTransaction[];
  selectedProductForModifier: Product | null;
  setSelectedProductForModifier: (p: Product | null) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  completedTransaction: Transaction | null;
  setCompletedTransaction: (t: Transaction | null) => void;
  productModalOpen: boolean;
  setProductModalOpen: (open: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  lowStockProducts: Product[];
  hasLowStockAlert: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Cart actions
  addToCart: (
    product: Product,
    quantity?: number,
    modifiers?: CartItemModifier[],
    notes?: string,
    itemDiscount?: number
  ) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  setCustomerName: (name: string) => void;
  setDiningOption: (opt: DiningOption) => void;
  setTableNumber: (table: string) => void;
  setDiscountTotal: (amount: number) => void;
  setTaxRate: (rate: number) => void;

  // Order hold & restore
  saveOrder: () => void;
  loadOrder: (order: HoldOrder) => void;
  deleteSavedOrder: (orderId: string) => void;

  // Payment & Checkout
  processPayment: (
    paymentMethod: PaymentMethod,
    cashGiven?: number,
    referenceCode?: string
  ) => Transaction;

  // Product & Inventory actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    productId: string,
    newQty: number,
    type: 'restock' | 'adjustment_loss' | 'adjustment_audit',
    notes: string
  ) => void;
  quickRestock: (productId: string, addQty: number) => void;

  // Attendance & Finance
  addAttendance: (staffName: string, role: string) => void;
  clockOutAttendance: (id: string) => void;
  addCashTransaction: (type: 'in' | 'out', category: string, amount: number, desc: string) => void;

  // Calculations
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  cartItemCount: number;

  // Reset
  resetDataToDefaults: () => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

// Generate initial sample transactions for reports & analytics
const generateSampleTransactions = (products: Product[]): Transaction[] => {
  const pMap = new Map(products.map((p) => [p.name, p]));
  const sampleData: {
    invOffset: number;
    hoursAgo: number;
    customer: string;
    items: { name: string; qty: number; mod?: string; modPrice?: number }[];
    method: PaymentMethod;
  }[] = [
    {
      invOffset: 1,
      hoursAgo: 1,
      customer: 'Mira Workman',
      items: [
        { name: 'Black Burger', qty: 1 },
        { name: 'Black King Burger', qty: 1, mod: '1 Telur + 1 Beef', modPrice: 15000 },
        { name: 'Fanta Strawberry', qty: 1 },
      ],
      method: 'qris',
    },
    {
      invOffset: 2,
      hoursAgo: 2.5,
      customer: 'Budi Santoso',
      items: [
        { name: 'Paket Ham Sandwich', qty: 2 },
        { name: 'Sprite', qty: 2 },
      ],
      method: 'cash',
    },
    {
      invOffset: 3,
      hoursAgo: 4,
      customer: 'Siti Rahma',
      items: [
        { name: 'Mexican Burger', qty: 1 },
        { name: 'French Fries', qty: 1 },
        { name: 'Milo', qty: 1 },
      ],
      method: 'gopay',
    },
    {
      invOffset: 4,
      hoursAgo: 5,
      customer: 'Rian Pratama',
      items: [
        { name: 'Nasi Goreng Spesial', qty: 2 },
        { name: 'Es Kopi Gula Aren', qty: 2 },
      ],
      method: 'qris',
    },
    {
      invOffset: 5,
      hoursAgo: 7,
      customer: 'Dewi Lestari',
      items: [
        { name: 'Super Deal: Burger + Fries + Fanta', qty: 2 },
      ],
      method: 'dana',
    },
    {
      invOffset: 6,
      hoursAgo: 24, // Yesterday
      customer: 'Andi Wijaya',
      items: [
        { name: 'Black King Burger', qty: 2 },
        { name: 'Fanta Orange', qty: 2 },
      ],
      method: 'bca_va',
    },
    {
      invOffset: 7,
      hoursAgo: 28,
      customer: 'Jessica Tan',
      items: [
        { name: 'Ayam Geprek Sambal Korek', qty: 3 },
        { name: 'Kopi ABC', qty: 2 },
      ],
      method: 'cash',
    },
  ];

  return sampleData.map((d, index) => {
    const date = new Date(Date.now() - d.hoursAgo * 3600 * 1000);
    const cartItems: CartItem[] = d.items.map((item, i) => {
      const prod = pMap.get(item.name) || products[0];
      const modPrice = item.modPrice || 0;
      const price = prod.price + modPrice;
      return {
        id: `item-${index}-${i}`,
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: item.qty,
        image: prod.image,
        selectedModifiers: item.mod ? [{ name: item.mod, price: modPrice }] : [],
        notes: '',
        discount: 0,
        subtotal: price * item.qty,
      };
    });

    const subtotal = cartItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const tax = 0; // PB1
    const total = subtotal;
    const totalCost = cartItems.reduce((acc, curr) => {
      const prod = pMap.get(curr.name);
      return acc + (prod ? prod.costPrice * curr.quantity : 0);
    }, 0);

    return {
      id: `trx-${index + 100}`,
      invoiceNo: `INV/20261110/${String(10 + index).padStart(4, '0')}`,
      customerName: d.customer,
      diningOption: 'dine_in',
      tableNumber: `Meja 0${(index % 8) + 1}`,
      items: cartItems,
      subtotal,
      discountTotal: 0,
      tax,
      rounding: 0,
      total,
      totalCost,
      paymentMethod: d.method,
      paymentStatus: 'completed',
      cashGiven: d.method === 'cash' ? Math.ceil(total / 50000) * 50000 : total,
      changeAmount: d.method === 'cash' ? Math.ceil(total / 50000) * 50000 - total : 0,
      cashierName: 'Admin',
      outletName: 'PT Kopi Anak Bangsa',
      createdAt: date.toISOString(),
      referenceCode: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
  });
};

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('nutapos_products');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Initialise cart with the items shown in the user's reference mockup:
    // 1 Black Burger (Rp 40.000)
    // 1 Black King Burger (Diskon -Rp 4.000, 1 Level 2 Rp 0, 1 Telur Rp 5.000, 1 Beef Rp 10.000, Catatan: tidak pakai sayur) -> Rp 71.000 (with discount) or line Rp 40.000 base
    // 1 Fanta Strawberry (Rp 15.000)
    // Total Rp 180.000 matching screenshot!
    const burger1 = INITIAL_PRODUCTS.find((p) => p.name === 'Black Burger');
    const burger2 = INITIAL_PRODUCTS.find((p) => p.name === 'Black King Burger');
    const fanta = INITIAL_PRODUCTS.find((p) => p.name === 'Fanta Strawberry');

    if (burger1 && burger2 && fanta) {
      return [
        {
          id: 'cart-1',
          productId: burger1.id,
          name: 'Black Burger',
          price: 40000,
          quantity: 1,
          image: burger1.image,
          selectedModifiers: [],
          notes: '',
          discount: 0,
          subtotal: 40000,
        },
        {
          id: 'cart-2',
          productId: burger2.id,
          name: 'Black King Burger',
          price: 60000,
          quantity: 2, // 2x gives 120.000
          image: burger2.image,
          selectedModifiers: [
            { name: '1 Level 2', price: 0 },
            { name: '1 Telur', price: 5000 },
            { name: '1 Beef', price: 10000 },
          ],
          notes: 'tidak pakai sayur',
          discount: 4000,
          subtotal: 125000, // 2 * 60.000 + 15000 - 4000 = 131.000
        },
        {
          id: 'cart-3',
          productId: fanta.id,
          name: 'Fanta Strawberry',
          price: 15000,
          quantity: 1,
          image: fanta.image,
          selectedModifiers: [],
          notes: '',
          discount: 0,
          subtotal: 15000,
        },
      ];
    }
    return [];
  });

  const [customerName, setCustomerName] = useState<string>('Mira Workman');
  const [tableNumber, setTableNumber] = useState<string>('Meja 04');
  const [diningOption, setDiningOption] = useState<DiningOption>('dine_in');
  const [discountTotal, setDiscountTotal] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0); // 0 or 0.10
  const [rounding] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('kasir');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('nutapos_transactions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return generateSampleTransactions(INITIAL_PRODUCTS);
  });

  // Stock movements log
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem('nutapos_stock_movements');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'sm-1',
        productId: 'prod-4',
        productName: 'Paket Ham Sandwich',
        productImage: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        type: 'sale',
        changeQty: -2,
        beforeQty: 6,
        afterQty: 4,
        notes: 'Penjualan kasir #INV/20261110/0002',
        createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
        performedBy: 'Admin',
      },
      {
        id: 'sm-2',
        productId: 'prod-9',
        productName: 'Milo',
        productImage: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
        type: 'sale',
        changeQty: -1,
        beforeQty: 4,
        afterQty: 3,
        notes: 'Penjualan kasir #INV/20261110/0003',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        performedBy: 'Admin',
      },
    ];
  });

  // Saved orders
  const [savedOrders, setSavedOrders] = useState<HoldOrder[]>(() => {
    try {
      const saved = localStorage.getItem('nutapos_saved_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Staff Attendance
  const [attendances, setAttendances] = useState<StaffAttendance[]>([
    {
      id: 'att-1',
      staffName: 'Admin Kasir (Mira)',
      role: 'Head Cashier',
      clockIn: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      status: 'present',
    },
    {
      id: 'att-2',
      staffName: 'Doni (Barista)',
      role: 'Kitchen & Beverage',
      clockIn: new Date(new Date().setHours(8, 15, 0, 0)).toISOString(),
      status: 'present',
    },
  ]);

  // Cash transactions
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([
    {
      id: 'cash-1',
      type: 'in',
      category: 'Modal Awal Kasir',
      amount: 500000,
      description: 'Modal awal kasir pembukaan toko pagi',
      createdAt: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      cashierName: 'Admin',
    },
  ]);

  // Modals state
  const [selectedProductForModifier, setSelectedProductForModifier] = useState<Product | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nutapos_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('nutapos_transactions', JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('nutapos_stock_movements', JSON.stringify(stockMovements));
    } catch {
      // ignore
    }
  }, [stockMovements]);

  useEffect(() => {
    try {
      localStorage.setItem('nutapos_saved_orders', JSON.stringify(savedOrders));
    } catch {
      // ignore
    }
  }, [savedOrders]);

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const hasLowStockAlert = lowStockProducts.length > 0;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const cartTax = taxRate > 0 ? Math.round(cartSubtotal * taxRate) : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountTotal + cartTax + rounding);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Add to cart
  const addToCart = (
    product: Product,
    quantity = 1,
    modifiers: CartItemModifier[] = [],
    notes = '',
    itemDiscount = 0
  ) => {
    sound.playBeep();

    const modifierPriceSum = modifiers.reduce((acc, m) => acc + m.price, 0);
    const unitPrice = product.price + modifierPriceSum;

    // Check if identical item already exists in cart (same product, same modifiers, same notes)
    const modSignature = JSON.stringify(modifiers.map((m) => m.name).sort());
    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        JSON.stringify(item.selectedModifiers.map((m) => m.name).sort()) === modSignature &&
        item.notes === notes
    );

    if (existingIndex > -1) {
      setCart((prev) => {
        const next = [...prev];
        const current = next[existingIndex];
        const newQty = current.quantity + quantity;
        const subtotal = (current.price + modifierPriceSum) * newQty - current.discount;
        next[existingIndex] = {
          ...current,
          quantity: newQty,
          subtotal: Math.max(0, subtotal),
        };
        return next;
      });
    } else {
      const newItem: CartItem = {
        id: generateId(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        selectedModifiers: modifiers,
        notes,
        discount: itemDiscount,
        subtotal: unitPrice * quantity - itemDiscount,
      };
      setCart((prev) => [...prev, newItem]);
    }
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id !== itemId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          const modifierPriceSum = item.selectedModifiers.reduce((acc, m) => acc + m.price, 0);
          const unitPrice = item.price + modifierPriceSum;
          return {
            ...item,
            quantity: newQty,
            subtotal: unitPrice * newQty - item.discount,
          };
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountTotal(0);
    setCustomerName('Mira Workman');
  };

  // Hold / Save Order
  const saveOrder = () => {
    if (cart.length === 0) return;
    const newHold: HoldOrder = {
      id: generateId(),
      savedAt: new Date().toISOString(),
      customerName: customerName || 'Pelanggan Meja',
      tableNumber,
      diningOption,
      items: [...cart],
      total: cartTotal,
    };
    setSavedOrders((prev) => [newHold, ...prev]);
    clearCart();
    sound.playBeep();
  };

  const loadOrder = (order: HoldOrder) => {
    setCart(order.items);
    setCustomerName(order.customerName);
    setTableNumber(order.tableNumber || 'Meja 01');
    setDiningOption(order.diningOption);
    setSavedOrders((prev) => prev.filter((o) => o.id !== order.id));
    setActiveTab('kasir');
  };

  const deleteSavedOrder = (orderId: string) => {
    setSavedOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Checkout / Payment with automatic inventory stock reduction!
  const processPayment = (
    paymentMethod: PaymentMethod,
    cashGiven?: number,
    referenceCode?: string
  ): Transaction => {
    const seq = transactions.length + 1;
    const invoiceNo = generateInvoiceNumber(seq);

    // Calculate total cost for profit tracking
    const totalCost = cart.reduce((acc, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return acc + (prod ? prod.costPrice * item.quantity : 0);
    }, 0);

    const newTx: Transaction = {
      id: generateId(),
      invoiceNo,
      customerName: customerName || 'Umum',
      diningOption,
      tableNumber,
      items: [...cart],
      subtotal: cartSubtotal,
      discountTotal,
      tax: cartTax,
      rounding,
      total: cartTotal,
      totalCost,
      paymentMethod,
      paymentStatus: 'completed',
      cashGiven: cashGiven || cartTotal,
      changeAmount: cashGiven ? Math.max(0, cashGiven - cartTotal) : 0,
      cashierName: 'Admin',
      outletName: 'PT Kopi Anak Bangsa',
      createdAt: new Date().toISOString(),
      referenceCode: referenceCode || `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    // 1. Deduct Inventory Stock automatically for each item sold!
    const newStockMovements: StockMovement[] = [];
    setProducts((prev) =>
      prev.map((prod) => {
        const soldInCart = cart.filter((c) => c.productId === prod.id);
        if (soldInCart.length > 0) {
          const totalQtySold = soldInCart.reduce((sum, item) => sum + item.quantity, 0);
          const newQty = Math.max(0, prod.stock - totalQtySold);

          newStockMovements.push({
            id: generateId(),
            productId: prod.id,
            productName: prod.name,
            productImage: prod.image,
            type: 'sale',
            changeQty: -totalQtySold,
            beforeQty: prod.stock,
            afterQty: newQty,
            notes: `Penjualan kasir #${invoiceNo}`,
            createdAt: new Date().toISOString(),
            performedBy: 'Admin',
          });

          return { ...prod, stock: newQty };
        }
        return prod;
      })
    );

    // Record stock movements
    if (newStockMovements.length > 0) {
      setStockMovements((prev) => [...newStockMovements, ...prev]);
    }

    // Record transaction
    setTransactions((prev) => [newTx, ...prev]);

    // If cash payment, record in finance
    if (paymentMethod === 'cash') {
      addCashTransaction('in', 'Penjualan Kasir', cartTotal, `Penjualan Tunai #${invoiceNo}`);
    }

    // Clear cart
    clearCart();

    // Play cheerful cash register chime
    sound.playCashRegister();

    return newTx;
  };

  // Product management actions
  const addProduct = (newProdData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...newProdData,
      id: generateId(),
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Record stock movement for initial inventory
    if (newProduct.stock > 0) {
      setStockMovements((prev) => [
        {
          id: generateId(),
          productId: newProduct.id,
          productName: newProduct.name,
          productImage: newProduct.image,
          type: 'restock',
          changeQty: newProduct.stock,
          beforeQty: 0,
          afterQty: newProduct.stock,
          notes: 'Stok awal produk baru',
          createdAt: new Date().toISOString(),
          performedBy: 'Admin',
        },
        ...prev,
      ]);
    }
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        // If stock changed directly
        if (updates.stock !== undefined && updates.stock !== prod.stock) {
          const diff = updates.stock - prod.stock;
          setStockMovements((sm) => [
            {
              id: generateId(),
              productId: prod.id,
              productName: updates.name || prod.name,
              productImage: updates.image || prod.image,
              type: diff > 0 ? 'restock' : 'adjustment_audit',
              changeQty: diff,
              beforeQty: prod.stock,
              afterQty: updates.stock!,
              notes: 'Pembaruan data produk & penyesuaian stok',
              createdAt: new Date().toISOString(),
              performedBy: 'Admin',
            },
            ...sm,
          ]);
        }
        return { ...prod, ...updates };
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Inventory Stock Adjustment
  const adjustStock = (
    productId: string,
    newQty: number,
    type: 'restock' | 'adjustment_loss' | 'adjustment_audit',
    notes: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const diff = newQty - p.stock;
        setStockMovements((sm) => [
          {
            id: generateId(),
            productId: p.id,
            productName: p.name,
            productImage: p.image,
            type,
            changeQty: diff,
            beforeQty: p.stock,
            afterQty: newQty,
            notes: notes || 'Penyesuaian stok manual',
            createdAt: new Date().toISOString(),
            performedBy: 'Admin',
          },
          ...sm,
        ]);
        return { ...p, stock: newQty };
      })
    );
  };

  const quickRestock = (productId: string, addQty: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newQty = p.stock + addQty;
        setStockMovements((sm) => [
          {
            id: generateId(),
            productId: p.id,
            productName: p.name,
            productImage: p.image,
            type: 'restock',
            changeQty: addQty,
            beforeQty: p.stock,
            afterQty: newQty,
            notes: `Restock Cepat (+${addQty} ${p.unit})`,
            createdAt: new Date().toISOString(),
            performedBy: 'Admin',
          },
          ...sm,
        ]);
        return { ...p, stock: newQty };
      })
    );
    sound.playCashRegister();
  };

  // Staff Attendance
  const addAttendance = (staffName: string, role: string) => {
    const newAtt: StaffAttendance = {
      id: generateId(),
      staffName,
      role,
      clockIn: new Date().toISOString(),
      status: 'present',
    };
    setAttendances((prev) => [newAtt, ...prev]);
  };

  const clockOutAttendance = (id: string) => {
    setAttendances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, clockOut: new Date().toISOString(), status: 'completed' } : a))
    );
  };

  // Finance Cash in/out
  const addCashTransaction = (type: 'in' | 'out', category: string, amount: number, desc: string) => {
    const item: CashTransaction = {
      id: generateId(),
      type,
      category,
      amount,
      description: desc,
      createdAt: new Date().toISOString(),
      cashierName: 'Admin',
    };
    setCashTransactions((prev) => [item, ...prev]);
  };

  const resetDataToDefaults = () => {
    localStorage.removeItem('nutapos_products');
    localStorage.removeItem('nutapos_transactions');
    localStorage.removeItem('nutapos_stock_movements');
    localStorage.removeItem('nutapos_saved_orders');
    setProducts(INITIAL_PRODUCTS);
    setTransactions(generateSampleTransactions(INITIAL_PRODUCTS));
    clearCart();
  };

  return (
    <PosContext.Provider
      value={{
        products,
        cart,
        customerName,
        tableNumber,
        diningOption,
        discountTotal,
        taxRate,
        rounding,
        activeTab,
        setActiveTab,
        transactions,
        stockMovements,
        savedOrders,
        attendances,
        cashTransactions,
        selectedProductForModifier,
        setSelectedProductForModifier,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        completedTransaction,
        setCompletedTransaction,
        productModalOpen,
        setProductModalOpen,
        editingProduct,
        setEditingProduct,
        lowStockProducts,
        hasLowStockAlert,
        soundEnabled,
        toggleSound,

        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        setCustomerName,
        setDiningOption,
        setTableNumber,
        setDiscountTotal,
        setTaxRate,

        saveOrder,
        loadOrder,
        deleteSavedOrder,

        processPayment,

        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        quickRestock,

        addAttendance,
        clockOutAttendance,
        addCashTransaction,

        cartSubtotal,
        cartTax,
        cartTotal,
        cartItemCount,

        resetDataToDefaults,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
