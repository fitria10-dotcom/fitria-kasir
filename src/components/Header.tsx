import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { formatRupiah } from '../utils/formatters';
import {
  Menu,
  Bell,
  Volume2,
  VolumeX,
  ChevronDown,
  AlertTriangle,
  Package,
  Plus,
  CheckCircle2,
  Store,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    lowStockProducts,
    quickRestock,
    setActiveTab,
    soundEnabled,
    toggleSound,
    savedOrders,
    loadOrder,
  } = usePos();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSavedOrders, setShowSavedOrders] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
      {/* Left section: Hamburger & Online status */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Toggle menu"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Online Indicator matching screenshot */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-gray-700 font-semibold text-xs tracking-wide">Online</span>
        </div>

        {/* Hold orders quick badge */}
        {savedOrders.length > 0 && (
          <button
            onClick={() => setShowSavedOrders(!showSavedOrders)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-800 rounded-full border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{savedOrders.length} Pesanan Ditahan</span>
          </button>
        )}
      </div>

      {/* Right section: Sounds, Notifications, User profile */}
      <div className="flex items-center gap-2 sm:gap-4 relative">
        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          title={soundEnabled ? 'Matikan Suara POS' : 'Aktifkan Suara POS'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Notification Bell matching screenshot */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowSavedOrders(false);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition relative cursor-pointer"
            aria-label="Notifikasi Stok Rendah"
            title="Pemberitahuan Stok"
          >
            <Bell className="w-5 h-5" />
            {lowStockProducts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm text-gray-800">
                    Notifikasi Stok ({lowStockProducts.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('stok');
                    setShowNotifications(false);
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                >
                  Kelola Stok →
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 px-2">
                {lowStockProducts.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                    Semua stok barang dalam kondisi aman dan mencukupi!
                  </div>
                ) : (
                  lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 hover:bg-amber-50/50 rounded-xl transition flex items-center gap-3"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 truncate">{p.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span className="font-semibold text-red-600">
                            Tersisa: {p.stock} {p.unit}
                          </span>
                          <span className="text-gray-400">• Min: {p.minStock}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => quickRestock(p.id, 10)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Tambah 10 stok otomatis"
                      >
                        <Plus className="w-3 h-3" />
                        Restock 10
                      </button>
                    </div>
                  ))
                )}
              </div>

              {lowStockProducts.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl text-center">
                  <button
                    onClick={() => {
                      setActiveTab('stok');
                      setShowNotifications(false);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Buka Dasbor Inventaris Terpadu
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Saved Orders dropdown */}
          {showSavedOrders && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-sm text-gray-800">Pesanan Tersimpan</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  {savedOrders.length}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {savedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 hover:bg-gray-50 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-800">{ord.customerName}</p>
                      <p className="text-[11px] text-gray-500">
                        {ord.tableNumber} • {ord.items.length} item • {formatRupiah(ord.total)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        loadOrder(ord);
                        setShowSavedOrders(false);
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Buka
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching screenshot */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowSavedOrders(false);
            }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 transition border border-transparent hover:border-gray-200 cursor-pointer"
          >
            {/* Green circular avatar with 'P' */}
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              P
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">PT Kopi Anak Bangsa</p>
              <p className="text-[11px] text-gray-400 leading-tight">Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* User Menu dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-800">PT Kopi Anak Bangsa</p>
                <p className="text-[11px] text-gray-400">Cabang Sudirman Utama</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('pengaturan');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-gray-400" />
                Profil Outlet & Pengaturan
              </button>
              <button
                onClick={() => {
                  setActiveTab('stok');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-gray-400" />
                Manajemen Persediaan
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
