import React from 'react';
import { usePos } from '../context/PosContext';
import { ActiveTab } from '../types/pos';
import {
  CreditCard,
  Receipt,
  Users,
  Wallet,
  Boxes,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  X,
  AlertCircle,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCloseShiftModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
  onOpenCloseShiftModal,
}) => {
  const { activeTab, setActiveTab, lowStockProducts } = usePos();

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    hasSubmenu?: boolean;
    badgeCount?: number;
  }[] = [
    {
      id: 'kasir',
      label: 'Kasir',
      icon: CreditCard,
    },
    {
      id: 'riwayat',
      label: 'Riwayat Penjualan',
      icon: Receipt,
    },
    {
      id: 'absensi',
      label: 'Absensi',
      icon: Users,
    },
    {
      id: 'keuangan',
      label: 'Keuangan',
      icon: Wallet,
    },
    {
      id: 'stok',
      label: 'Stok',
      icon: Boxes,
      hasSubmenu: true,
      badgeCount: lowStockProducts.length > 0 ? lowStockProducts.length : undefined,
    },
    {
      id: 'laporan',
      label: 'Laporan',
      icon: BarChart3,
      hasSubmenu: true,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: Settings,
      hasSubmenu: true,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-5 bg-white select-none">
      <div>
        {/* Nutapos Brand Logo */}
        <div className="px-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Custom stylized green nutapos leaf badge */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <span className="font-extrabold text-lg tracking-tighter">n</span>
            </div>
            {!isCollapsed && (
              <span className="text-2xl font-black tracking-tight text-emerald-600">
                nutapos
              </span>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-emerald-600' : 'text-gray-500'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1.5">
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {item.badgeCount}
                      </span>
                    )}
                    {item.hasSubmenu && (
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isActive ? 'rotate-180 text-emerald-600' : ''
                        }`}
                      />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom action: Tutup Outlet matching screenshot */}
      <div className="px-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => {
            onOpenCloseShiftModal();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title="Tutup Outlet / Rekap Kasir"
        >
          <LogOut className="w-5 h-5 text-gray-400 hover:text-red-500 shrink-0" />
          {!isCollapsed && <span>Tutup Outlet</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block bg-white border-r border-gray-100 transition-all duration-200 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
