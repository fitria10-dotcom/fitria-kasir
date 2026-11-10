import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { ProductCategory, Product } from '../types/pos';
import { ProductCard } from './ProductCard';
import { Search, Plus, X, Barcode, Filter, Sparkles } from 'lucide-react';

const CATEGORY_TABS: ProductCategory[] = [
  'Semua',
  'Makanan',
  'Minuman',
  'Snack',
  'Dessert',
  'Alacarte',
  'Super Deal',
];

export const KasirView: React.FC = () => {
  const {
    products,
    addToCart,
    setSelectedProductForModifier,
    setProductModalOpen,
    setEditingProduct,
  } = usePos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Semua');

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCat = selectedCategory === 'Semua' || prod.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Calculate item counts per category tab for realistic labels
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Semua: products.length,
    };
    CATEGORY_TABS.forEach((cat) => {
      if (cat !== 'Semua') {
        counts[cat] = products.filter((p) => p.category === cat).length;
      }
    });
    return counts;
  }, [products]);

  const handleProductClick = (product: Product) => {
    // If product has modifiers, open the modifier customization modal
    if (product.modifiers && product.modifiers.length > 0) {
      setSelectedProductForModifier(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden select-none">
      {/* 1. Search Bar matching screenshot ("Cari produk di sini") */}
      <div className="p-4 pb-2 bg-white border-b border-gray-150">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk di sini..."
            className="w-full text-xs font-semibold pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-emerald-500 transition"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-3.5 flex items-center gap-1.5 text-gray-400">
              <Barcode className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* 2. Category Filter Pills matching screenshot */}
      <div className="px-4 py-3 bg-white border-b border-gray-150 overflow-x-auto flex items-center gap-2 no-scrollbar">
        {CATEGORY_TABS.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-400 shadow-2xs font-extrabold'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {isSelected && <span className="text-emerald-600 text-xs font-black">✓</span>}
              <span>{cat}</span>
              <span className="text-[11px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. Product Cards Grid with real food photography and the famous "+" tile */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}

          {/* Plus (+) Button Tile to Add Product matching screenshot */}
          <div
            onClick={handleAddNewProduct}
            className="group min-h-[170px] bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer shadow-xs select-none"
            title="Tambah Produk Baru dengan Foto Sendiri"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition shadow-2xs mb-2">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <p className="text-xs font-bold text-gray-700 group-hover:text-emerald-700 transition">
              Tambah Produk
            </p>
            <p className="text-[10px] text-gray-400 text-center mt-0.5">
              Upload foto / Link gambar
            </p>
          </div>
        </div>

        {/* Empty search state */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Filter className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-600">Tidak ada produk ditemukan</p>
            <p className="text-xs text-gray-400 mt-1">
              Coba kata kunci lain atau pilih kategori berbeda.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="mt-3 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 transition cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
