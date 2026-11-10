import React from 'react';
import { Product } from '../types/pos';
import { formatRupiah } from '../utils/formatters';
import { AlertCircle, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.minStock;

  return (
    <div
      onClick={!isOutOfStock ? onClick : undefined}
      className={`group relative bg-white rounded-2xl border border-gray-150 p-3.5 flex flex-col justify-between transition-all duration-200 select-none ${
        isOutOfStock
          ? 'opacity-60 cursor-not-allowed bg-gray-50/80 border-gray-200'
          : 'hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 cursor-pointer shadow-xs'
      }`}
    >
      {/* Top stock badges */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 items-end">
        {isOutOfStock ? (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
            Habis
          </span>
        ) : isLowStock ? (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200 flex items-center gap-0.5 animate-pulse">
            <AlertCircle className="w-2.5 h-2.5" />
            Sisa {product.stock}
          </span>
        ) : (
          <span className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white/80 rounded-md backdrop-blur-xs">
            {product.stock} {product.unit}
          </span>
        )}
      </div>

      {/* Image container with high quality food photograph */}
      <div className="w-full aspect-square max-h-32 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-1.5 my-1">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
          }}
        />
      </div>

      {/* Product Information */}
      <div className="mt-2 text-center flex-1 flex flex-col justify-end">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">
          {formatRupiah(product.price)}
        </p>
      </div>

      {/* Quick Add indicator on hover */}
      {!isOutOfStock && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-center text-emerald-600 text-xs font-semibold group-hover:bg-emerald-50 rounded-lg py-1 transition-colors">
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Tambah</span>
        </div>
      )}
    </div>
  );
};
