import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { formatRupiah } from '../utils/formatters';
import { DiningOption } from '../types/pos';
import {
  MoreHorizontal,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Edit2,
  BookmarkPlus,
  Check,
} from 'lucide-react';

interface CartPanelProps {
  onOpenPayment: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onOpenPayment }) => {
  const {
    cart,
    customerName,
    setCustomerName,
    tableNumber,
    setTableNumber,
    diningOption,
    setDiningOption,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    discountTotal,
    setDiscountTotal,
    cartTax,
    taxRate,
    setTaxRate,
    rounding,
    cartTotal,
    saveOrder,
  } = usePos();

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [tempName, setTempName] = useState(customerName);
  const [tempTable, setTempTable] = useState(tableNumber);
  const [showDiningModal, setShowDiningModal] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [tempDiscount, setTempDiscount] = useState<number>(discountTotal);

  const handleSaveCustomer = () => {
    setCustomerName(tempName || 'Pelanggan');
    setTableNumber(tempTable || 'Meja 01');
    setIsEditingCustomer(false);
  };

  const diningLabels: Record<DiningOption, { label: string; icon: React.ElementType }> = {
    dine_in: { label: 'Makan ditempat', icon: UtensilsCrossed },
    takeaway: { label: 'Bawa Pulang (Takeaway)', icon: ShoppingBag },
    delivery: { label: 'Pesan Antar (Delivery)', icon: Bike },
  };

  const CurrentDiningIcon = diningLabels[diningOption].icon;

  return (
    <div className="bg-white border-r border-gray-150 flex flex-col h-full w-full max-w-full md:w-80 lg:w-96 select-none shrink-0 shadow-xs">
      {/* 1. Big Total Display Box matching screenshot */}
      <div className="p-4 border-b border-gray-100">
        <div className="bg-emerald-50/40 border border-emerald-200/60 rounded-2xl p-4 text-center shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/80 mb-0.5">
            Total Tagihan
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {formatRupiah(cartTotal)}
          </h1>
        </div>
      </div>

      {/* 2. Customer Name & Action Header matching screenshot */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 bg-gray-50/40">
        {isEditingCustomer ? (
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Nama Pelanggan"
              className="text-xs font-semibold px-2 py-1 border border-emerald-300 rounded-lg flex-1 bg-white focus:outline-emerald-500"
              autoFocus
            />
            <input
              type="text"
              value={tempTable}
              onChange={(e) => setTempTable(e.target.value)}
              placeholder="No. Meja"
              className="text-xs font-semibold px-2 py-1 border border-emerald-300 rounded-lg w-20 bg-white focus:outline-emerald-500"
            />
            <button
              onClick={handleSaveCustomer}
              className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              setTempName(customerName);
              setTempTable(tableNumber);
              setIsEditingCustomer(true);
            }}
            className="flex items-center gap-2 cursor-pointer group"
            title="Klik untuk ubah nama pelanggan / meja"
          >
            <span className="text-sm font-bold text-emerald-600 group-hover:underline">
              {customerName || 'Nama Pelanggan'}
            </span>
            <span className="text-xs text-gray-400 font-medium">({tableNumber})</span>
            <Edit2 className="w-3 h-3 text-gray-400 group-hover:text-emerald-600 transition" />
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showOptionsDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-40">
              <button
                onClick={() => {
                  setShowDiscountModal(true);
                  setShowOptionsDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Beri Diskon Nota</span>
                {discountTotal > 0 && (
                  <span className="text-[10px] text-red-600 font-bold">
                    -{formatRupiah(discountTotal)}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setTaxRate(taxRate === 0 ? 0.1 : 0);
                  setShowOptionsDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Pajak Restoran PB1 (10%)</span>
                <span className="text-[10px] font-bold text-emerald-600">
                  {taxRate > 0 ? 'Aktif' : 'Nonaktif'}
                </span>
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowOptionsDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Pesanan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Cart Items List matching screenshot structure */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 divide-y divide-gray-100">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-sm font-bold text-gray-700">Keranjang Masih Kosong</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
              Pilih menu makanan atau minuman dari katalog untuk mulai memesan
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="pt-3 first:pt-0">
              {/* Primary line: Quantity + Name + Subtotal */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 max-w-[65%]">
                  <span className="font-bold text-sm text-gray-900 shrink-0">
                    {item.quantity}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium">
                      @{formatRupiah(item.price)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>

              {/* Modifiers & details indented matching screenshot */}
              {(item.selectedModifiers.length > 0 || item.notes || item.discount > 0) && (
                <div className="pl-5 mt-1.5 space-y-0.5 text-xs text-gray-500">
                  {item.discount > 0 && (
                    <div className="flex justify-between text-red-500 font-medium">
                      <span>Diskon</span>
                      <span>-{formatRupiah(item.discount)}</span>
                    </div>
                  )}

                  {item.selectedModifiers.map((mod, i) => (
                    <div key={i} className="flex justify-between text-gray-500">
                      <span>{mod.name}</span>
                      <span>{formatRupiah(mod.price)}</span>
                    </div>
                  ))}

                  {item.notes && (
                    <p className="text-[11px] text-gray-400 italic mt-0.5">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Quantity adjusters */}
              <div className="flex items-center justify-end gap-1.5 mt-2">
                <button
                  onClick={() => updateCartQuantity(item.id, -1)}
                  className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                  title="Kurang 1"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold text-gray-800 px-2">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateCartQuantity(item.id, 1)}
                  className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                  title="Tambah 1"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition ml-1 cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Dining Option Selector matching screenshot ("Makan ditempat >") */}
      <div className="px-4 py-2 border-t border-b border-gray-100 bg-gray-50/50">
        <button
          onClick={() => setShowDiningModal(true)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 py-1 cursor-pointer"
        >
          <CurrentDiningIcon className="w-3.5 h-3.5" />
          <span>{diningLabels[diningOption].label}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. Summary calculations matching screenshot */}
      <div className="px-4 py-3 space-y-1.5 text-xs text-gray-600 bg-white">
        <div className="flex justify-between">
          <span>Total sebelum pajak</span>
          <span className="font-semibold text-gray-800">{formatRupiah(cartSubtotal)}</span>
        </div>

        {discountTotal > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Diskon Nota</span>
            <span className="font-semibold">-{formatRupiah(discountTotal)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <span>pb1 (Pajak Resto)</span>
            {taxRate > 0 && (
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">
                10%
              </span>
            )}
          </div>
          <span className="font-semibold text-gray-800">{formatRupiah(cartTax)}</span>
        </div>

        <div className="flex justify-between">
          <span>Pembulatan</span>
          <span className="font-semibold text-gray-800">{formatRupiah(rounding)}</span>
        </div>

        <div className="flex justify-between pt-1.5 border-t border-gray-100 text-sm font-bold text-gray-900">
          <span>Total Harga</span>
          <span className="text-emerald-700">{formatRupiah(cartTotal)}</span>
        </div>
      </div>

      {/* 6. Action Buttons matching screenshot ("Simpan pesanan" & "Bayar") */}
      <div className="p-4 pt-2 border-t border-gray-100 grid grid-cols-2 gap-3 bg-white">
        <button
          onClick={saveOrder}
          disabled={cart.length === 0}
          className="py-3 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <BookmarkPlus className="w-4 h-4 text-gray-500" />
          <span>Simpan pesanan</span>
        </button>

        <button
          onClick={onOpenPayment}
          disabled={cart.length === 0}
          className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-md shadow-emerald-600/20 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Bayar
        </button>
      </div>

      {/* Modal: Dining Option Selector */}
      {showDiningModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Pilih Jenis Pelayanan</h3>
            <div className="space-y-2">
              {(
                [
                  { id: 'dine_in', label: 'Makan ditempat (Dine In)', desc: 'Pelanggan makan di restoran', icon: UtensilsCrossed },
                  { id: 'takeaway', label: 'Bawa Pulang (Takeaway)', desc: 'Bungkus makanan dibawa pulang', icon: ShoppingBag },
                  { id: 'delivery', label: 'Pesan Antar (Delivery)', desc: 'Pengantaran kurir online / outlet', icon: Bike },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const isSelected = diningOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setDiningOption(opt.id);
                      setShowDiningModal(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[11px] text-gray-400">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowDiningModal(false)}
              className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Modal: Discount Editor */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Diskon Total Nota</h3>
            <p className="text-xs text-gray-500 mb-3">Masukkan potongan harga untuk seluruh tagihan:</p>
            <input
              type="number"
              value={tempDiscount}
              onChange={(e) => setTempDiscount(Math.max(0, Number(e.target.value)))}
              className="w-full text-base font-bold p-2.5 border border-gray-300 rounded-xl mb-3 focus:outline-emerald-500"
              placeholder="0"
            />
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[5000, 10000, 20000].map((d) => (
                <button
                  key={d}
                  onClick={() => setTempDiscount(d)}
                  className="py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                >
                  +{d / 1000}k
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setDiscountTotal(tempDiscount);
                  setShowDiscountModal(false);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
