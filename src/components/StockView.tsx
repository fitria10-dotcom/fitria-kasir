import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { Product, ProductCategory } from '../types/pos';
import { formatRupiah, formatDateTimeIndo } from '../utils/formatters';
import {
  Boxes,
  AlertTriangle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  History,
  TrendingDown,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  X,
} from 'lucide-react';

export const StockView: React.FC = () => {
  const {
    products,
    stockMovements,
    adjustStock,
    quickRestock,
    setProductModalOpen,
    setEditingProduct,
    deleteProduct,
  } = usePos();

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'movements'>('inventory');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Adjustment Modal state
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'restock' | 'adjustment_loss' | 'adjustment_audit'>('restock');
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');

  // Quick image preview modal
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  // Calculations for KPI Cards
  const totalSku = products.length;
  const outOfStockItems = products.filter((p) => p.stock <= 0);
  const lowStockItems = products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const safeStockItems = products.filter((p) => p.stock > p.minStock);
  const totalStockAssetValue = products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;

      let matchStatus = true;
      if (filterStockStatus === 'low') {
        matchStatus = p.stock <= p.minStock;
      } else if (filterStockStatus === 'out') {
        matchStatus = p.stock <= 0;
      }

      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchQuery, selectedCategory, filterStockStatus]);

  const handleOpenAdjustModal = (product: Product) => {
    setAdjustingProduct(product);
    setAdjustmentQty(product.stock);
    setAdjustmentType('restock');
    setAdjustmentNotes('');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    adjustStock(
      adjustingProduct.id,
      adjustmentQty,
      adjustmentType,
      adjustmentNotes ||
        (adjustmentType === 'restock'
          ? 'Penambahan stok inventaris'
          : adjustmentType === 'adjustment_loss'
          ? 'Pengurangan barang rusak/hilang'
          : 'Hasil stok opname fisik')
    );

    setAdjustingProduct(null);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Sistem Inventaris & Detail Stok Terpadu
            </h1>
            {lowStockItems.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lowStockItems.length} Stok Menipis
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola persediaan barang akurat dengan foto produk, batas minimum stok, dan pencatatan mutasi otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk & Foto</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total SKU */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Total SKU</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">{totalSku}</h3>
          <p className="text-[11px] text-gray-400 mt-1">Menu aktif terdaftar</p>
        </div>

        {/* Card 2: Total Nilai Aset Stok */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Nilai Aset Stok (HPP)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-700 truncate">
            {formatRupiah(totalStockAssetValue)}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Total modal persediaan</p>
        </div>

        {/* Card 3: Stok Menipis (Alert) */}
        <div
          onClick={() => setFilterStockStatus(filterStockStatus === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer ${
            lowStockItems.length > 0
              ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-100/70'
              : 'bg-white border-gray-150'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold">Perlu Restock</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-black text-amber-900">{lowStockItems.length}</h3>
          <p className="text-[11px] text-amber-700 mt-1">Stok ≤ Batas Minimum</p>
        </div>

        {/* Card 4: Stok Habis */}
        <div
          onClick={() => setFilterStockStatus(filterStockStatus === 'out' ? 'all' : 'out')}
          className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer ${
            outOfStockItems.length > 0
              ? 'bg-red-50/70 border-red-300 hover:bg-red-100/70'
              : 'bg-white border-gray-150'
          }`}
        >
          <div className="flex items-center justify-between text-red-800 mb-2">
            <span className="text-xs font-bold">Stok Habis</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-2xl font-black text-red-900">{outOfStockItems.length}</h3>
          <p className="text-[11px] text-red-700 mt-1">Perlu pengadaan segera</p>
        </div>
      </div>

      {/* 3. Sub Tabs & Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* SubTab switcher */}
          <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('inventory')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'inventory'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daftar Detail Stok
            </button>
            <button
              onClick={() => setActiveSubTab('movements')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'movements'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Mutasi Stok ({stockMovements.length})</span>
            </button>
          </div>

          {/* Search & Filter tools */}
          {activeSubTab === 'inventory' && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status filter buttons */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFilterStockStatus('all')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterStockStatus === 'all' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  Semua ({products.length})
                </button>
                <button
                  onClick={() => setFilterStockStatus('low')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterStockStatus === 'low' ? 'bg-white text-amber-800 font-bold shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  Menipis ({lowStockItems.length})
                </button>
                <button
                  onClick={() => setFilterStockStatus('out')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterStockStatus === 'out' ? 'bg-white text-red-800 font-bold shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  Habis ({outOfStockItems.length})
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari SKU atau nama..."
                  className="text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-emerald-500 w-44"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. INVENTORY DETAIL TABLE WITH PRODUCT PHOTOS */}
        {activeSubTab === 'inventory' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4 w-16">Foto Produk</th>
                  <th className="py-3.5 px-4">Nama Produk & SKU</th>
                  <th className="py-3.5 px-3">Kategori</th>
                  <th className="py-3.5 px-3 text-center">Stok Saat Ini</th>
                  <th className="py-3.5 px-3 text-center">Batas Min</th>
                  <th className="py-3.5 px-3 text-right">Harga Modal (HPP)</th>
                  <th className="py-3.5 px-3 text-right">Harga Jual</th>
                  <th className="py-3.5 px-3 text-right">Nilai Total Stok</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi Inventaris</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredProducts.map((prod) => {
                  const isOut = prod.stock <= 0;
                  const isLow = !isOut && prod.stock <= prod.minStock;
                  const totalValue = prod.stock * prod.costPrice;

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-gray-50/80 transition ${
                        isLow ? 'bg-amber-50/20' : isOut ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* FOTO PRODUK THUMBNAIL (As specifically requested by user) */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setPreviewImage({ url: prod.image, name: prod.name })}
                          className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition group relative"
                          title="Klik untuk perbesar foto"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        </div>
                      </td>

                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 text-sm">{prod.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">SKU: {prod.sku}</p>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-700 rounded-md">
                          {prod.category}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                            isOut
                              ? 'bg-red-100 text-red-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {prod.stock} {prod.unit}
                        </span>
                      </td>

                      {/* Min Stock threshold */}
                      <td className="py-3 px-3 text-center text-gray-500">
                        {prod.minStock} {prod.unit}
                      </td>

                      {/* Cost (HPP) */}
                      <td className="py-3 px-3 text-right font-mono text-gray-600">
                        {formatRupiah(prod.costPrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 text-right font-bold font-mono text-gray-900">
                        {formatRupiah(prod.price)}
                      </td>

                      {/* Total Inventory Value */}
                      <td className="py-3 px-3 text-right font-bold font-mono text-emerald-700">
                        {formatRupiah(totalValue)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                            Habis
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Menipis
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                            Aman
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick restock buttons */}
                          <button
                            onClick={() => quickRestock(prod.id, 10)}
                            className="px-2 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition cursor-pointer"
                            title="Restock cepat +10 unit"
                          >
                            +10
                          </button>

                          <button
                            onClick={() => handleOpenAdjustModal(prod)}
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Sesuaikan stok (Audit/Rusak/Masuk)"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleEditProduct(prod)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit data & foto produk"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus produk "${prod.name}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* 5. STOCK MOVEMENT LOG (Audit Trail) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Foto & Produk</th>
                  <th className="py-3 px-3">Tipe Mutasi</th>
                  <th className="py-3 px-3 text-center">Perubahan</th>
                  <th className="py-3 px-3 text-center">Sebelum</th>
                  <th className="py-3 px-3 text-center">Sesudah</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-right">Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {stockMovements.map((sm) => (
                  <tr key={sm.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                      {formatDateTimeIndo(sm.createdAt)}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <img
                        src={sm.productImage}
                        alt={sm.productName}
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                      />
                      <span className="font-bold text-gray-900">{sm.productName}</span>
                    </td>
                    <td className="py-3 px-3">
                      {sm.type === 'sale' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md">
                          Penjualan
                        </span>
                      ) : sm.type === 'restock' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                          Barang Masuk
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 rounded-md">
                          Penyesuaian
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span
                        className={sm.changeQty > 0 ? 'text-emerald-600' : 'text-red-600'}
                      >
                        {sm.changeQty > 0 ? `+${sm.changeQty}` : sm.changeQty}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-gray-400">{sm.beforeQty}</td>
                    <td className="py-3 px-3 text-center font-bold text-gray-800">{sm.afterQty}</td>
                    <td className="py-3 px-4 text-gray-600">{sm.notes}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-500">
                      {sm.performedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: STOCK ADJUSTMENT */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={adjustingProduct.image}
                  alt={adjustingProduct.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{adjustingProduct.name}</h3>
                  <p className="text-xs text-gray-400">
                    Stok saat ini: <strong>{adjustingProduct.stock} {adjustingProduct.unit}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Jenis Penyesuaian</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as typeof adjustmentType)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-300 rounded-xl bg-white focus:outline-emerald-500"
                >
                  <option value="restock">Tambah Stok Baru (Barang Masuk / Pembelian)</option>
                  <option value="adjustment_audit">Stok Opname (Koreksi Hitung Fisik)</option>
                  <option value="adjustment_loss">Barang Rusak / Kadaluarsa (Pengurangan)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {adjustmentType === 'restock'
                    ? 'Total Stok Setelah Restock'
                    : 'Stok Fisik Baru'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Math.max(0, Number(e.target.value)))}
                  className="w-full text-lg font-black p-2.5 border-2 border-emerald-400 rounded-xl text-center focus:outline-emerald-500"
                />
                <p className="text-[11px] text-gray-400 text-center">
                  Selisih perubahan: {adjustmentQty - adjustingProduct.stock > 0 ? '+' : ''}
                  {adjustmentQty - adjustingProduct.stock} {adjustingProduct.unit}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Alasan / Catatan Penyesuaian</label>
                <input
                  type="text"
                  required
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="Contoh: Penerimaan barang dari supplier, barang kemasan rusak, dll."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white p-3 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="w-full h-64 object-cover rounded-2xl"
            />
            <p className="text-sm font-bold text-gray-800 mt-3">{previewImage.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}
    </div>
  );
};
