import React, { useState } from 'react';
import { Product, CartItemModifier } from '../types/pos';
import { formatRupiah } from '../utils/formatters';
import { X, Plus, Minus, Check, MessageSquare } from 'lucide-react';

interface ItemModifierModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    modifiers: CartItemModifier[],
    notes: string,
    discount: number
  ) => void;
}

export const ItemModifierModal: React.FC<ItemModifierModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  // Grouped modifiers selection
  // Map of groupName -> selected modifier option
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, { name: string; price: number }>>(() => {
    const initial: Record<string, { name: string; price: number }> = {};
    if (product.modifiers) {
      product.modifiers.forEach((group) => {
        if (group.required && group.options.length > 0) {
          initial[group.groupName] = group.options[0];
        }
      });
    }
    return initial;
  });

  const handleToggleModifier = (groupName: string, option: { name: string; price: number }) => {
    setSelectedModifiers((prev) => {
      const next = { ...prev };
      if (next[groupName]?.name === option.name) {
        // Toggle off if not required
        delete next[groupName];
      } else {
        next[groupName] = option;
      }
      return next;
    });
  };

  const activeModifiersList: CartItemModifier[] = Object.entries(selectedModifiers).map(
    ([groupName, opt]) => ({
      name: opt.name,
      price: opt.price,
      groupName,
    })
  );

  const modifiersPriceSum = activeModifiersList.reduce((acc, m) => acc + m.price, 0);
  const unitPrice = product.price + modifiersPriceSum;
  const totalPrice = Math.max(0, unitPrice * quantity - discount);

  const handleSubmit = () => {
    onAddToCart(product, quantity, activeModifiersList, notes, discount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header with image banner */}
        <div className="relative bg-gray-50 border-b border-gray-100 p-4 sm:p-5 flex items-center gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-xs shrink-0"
          />
          <div className="flex-1 min-w-0 pr-8">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-1 truncate">
              {product.name}
            </h2>
            <p className="text-xs text-gray-500 line-clamp-1">{product.description || 'Pilihan lezat favorit pelanggan.'}</p>
            <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
              {formatRupiah(product.price)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Modifiers, Notes, Discount */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Modifiers groups */}
          {product.modifiers && product.modifiers.length > 0 ? (
            product.modifiers.map((group) => (
              <div key={group.groupName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {group.groupName}
                  </h3>
                  {group.required ? (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Wajib Pilih 1
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400">Opsional</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((option) => {
                    const isSelected = selectedModifiers[group.groupName]?.name === option.name;
                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => handleToggleModifier(group.groupName, option)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer text-xs ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{option.name}</span>
                        </div>
                        <span className="text-gray-500 font-semibold shrink-0 ml-1">
                          {option.price > 0 ? `+${formatRupiah(option.price)}` : 'Gratis'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-2 text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl">
              Menu ini siap dipesan langsung tanpa pilihan modifikasi tambahan.
            </div>
          )}

          {/* Customer notes / instruksi khusus */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              <span>Catatan Pesanan (Contoh: "tidak pakai sayur", "es sedikit")</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan khusus untuk koki/barista..."
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-emerald-500 bg-white"
            />
          </div>

          {/* Quick discount for item */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-700">Potongan Diskon Item</p>
              <p className="text-[11px] text-gray-400">Khusus untuk menu ini</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1000"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-24 text-xs font-semibold p-2 border border-gray-200 rounded-lg text-right focus:outline-emerald-500"
              />
              <span className="text-xs text-gray-500">IDR</span>
            </div>
          </div>
        </div>

        {/* Footer: Quantity + Add Button */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-xl border border-gray-200 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-lg text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-gray-800 px-3 min-w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-lg text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-between cursor-pointer"
          >
            <span>Tambah ke Pesanan</span>
            <span>{formatRupiah(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
