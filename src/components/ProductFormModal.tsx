import React, { useState, useRef } from 'react';
import { Product, ProductCategory } from '../types/pos';
import { FOOD_PHOTO_PRESETS } from '../data/initialProducts';
import { formatRupiah } from '../utils/formatters';
import {
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ProductFormModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id'>) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Makanan',
  'Minuman',
  'Snack',
  'Dessert',
  'Alacarte',
  'Super Deal',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || `PRD-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Makanan');
  const [price, setPrice] = useState<number>(product?.price || 25000);
  const [costPrice, setCostPrice] = useState<number>(product?.costPrice || 12000);
  const [stock, setStock] = useState<number>(product?.stock || 20);
  const [minStock, setMinStock] = useState<number>(product?.minStock || 5);
  const [unit, setUnit] = useState<string>(product?.unit || 'Porsi');
  const [image, setImage] = useState<string>(
    product?.image ||
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80'
  );
  const [description, setDescription] = useState(product?.description || '');
  const [imageMode, setImageMode] = useState<'upload' | 'url' | 'presets'>('presets');
  const [uploadError, setUploadError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local image upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran gambar maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      sku: sku.trim() || `PRD-${Date.now().toString().slice(-4)}`,
      category,
      price: Math.max(0, price),
      costPrice: Math.max(0, costPrice),
      stock: Math.max(0, stock),
      minStock: Math.max(1, minStock),
      unit: unit.trim() || 'Pcs',
      image:
        image.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      description: description.trim(),
      modifiers: product?.modifiers || [
        {
          groupName: 'Topping Tambahan',
          required: false,
          options: [
            { name: 'Extra Keju', price: 5000 },
            { name: 'Extra Telur', price: 5000 },
          ],
        },
      ],
      isAvailable: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              {product ? 'Edit Produk & Foto Menu' : 'Tambah Produk Baru'}
            </h2>
            <p className="text-xs text-gray-500">
              Atur informasi menu makanan/minuman, foto produk, harga jual, dan stok persediaan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. PHOTO SECTION: Upload File, URL Input, or Presets */}
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Foto Produk Menu Makanan / Minuman</span>
              </label>

              {/* Mode switch */}
              <div className="flex bg-gray-200/70 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setImageMode('presets')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    imageMode === 'presets' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-gray-600'
                  }`}
                >
                  Pilihan Foto
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    imageMode === 'upload' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-gray-600'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    imageMode === 'url' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-gray-600'
                  }`}
                >
                  Link URL
                </button>
              </div>
            </div>

            {/* Preview Box & Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-dashed border-emerald-300 bg-white shrink-0 shadow-xs">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs">
                  Pratinjau
                </span>
              </div>

              <div className="flex-1 w-full space-y-2">
                {imageMode === 'upload' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/50 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Pilih Foto dari Galeri / Komputer</span>
                    </button>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Mendukung format JPG, PNG, atau WebP (maks. 5MB).
                    </p>
                    {uploadError && (
                      <p className="text-xs text-red-500 font-semibold mt-1">{uploadError}</p>
                    )}
                  </div>
                )}

                {imageMode === 'url' && (
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-emerald-500"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Tempel URL gambar langsung dari internet atau hosting foto Anda.
                    </p>
                  </div>
                )}

                {imageMode === 'presets' && (
                  <div>
                    <p className="text-[11px] text-gray-500 mb-1.5 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Klik salah satu foto rekomendasi siap pakai di bawah:</span>
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                      {FOOD_PHOTO_PRESETS.slice(0, 8).map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                            image === preset.url
                              ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                              : 'border-transparent hover:border-emerald-300'
                          }`}
                          title={preset.name}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                          {image === preset.url && (
                            <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center text-white">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Basic Info: Name, Category, SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-700">Nama Menu Produk *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Crispy Chicken Burger"
                className="w-full text-xs font-semibold p-2.5 border border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full text-xs font-semibold p-2.5 border border-gray-300 rounded-xl bg-white focus:outline-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Pricing: Selling Price & HPP (Cost Price) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800">
                Harga Jual Kasir (IDR) *
              </label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-sm font-bold p-2.5 border border-emerald-300 bg-white rounded-xl focus:outline-emerald-500"
              />
              <p className="text-[11px] text-gray-400">Harga yang ditampilkan kepada pelanggan</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800">
                Harga Modal / HPP (IDR)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full text-sm font-semibold p-2.5 border border-gray-300 bg-white rounded-xl focus:outline-emerald-500"
              />
              <p className="text-[11px] text-emerald-700 font-medium">
                Estimasi Margin: {formatRupiah(Math.max(0, price - costPrice))} (
                {price > 0 ? Math.round(((price - costPrice) / price) * 100) : 0}%)
              </p>
            </div>
          </div>

          {/* 4. Stock & Inventory Management */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Stok Awal Saat Ini *</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                Batas Minimum Stok (Alert) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full text-xs font-bold p-2.5 border border-amber-300 bg-amber-50/30 rounded-xl focus:outline-emerald-500"
              />
              <p className="text-[10px] text-amber-700">
                Notifikasi merah akan muncul jika stok di bawah nilai ini.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Satuan Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 border border-gray-300 rounded-xl bg-white focus:outline-emerald-500"
              >
                <option value="Porsi">Porsi</option>
                <option value="Pcs">Pcs</option>
                <option value="Botol">Botol</option>
                <option value="Gelas">Gelas</option>
                <option value="Cup">Cup</option>
                <option value="Kaleng">Kaleng</option>
                <option value="Paket">Paket</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Deskripsi Menu (Opsional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi bahan atau keistimewaan menu ini..."
              className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              Simpan Produk & Foto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
