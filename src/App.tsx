import React, { useState } from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KasirView } from './components/KasirView';
import { CartPanel } from './components/CartPanel';
import { StockView } from './components/StockView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { FinanceView } from './components/FinanceView';
import { AttendanceView } from './components/AttendanceView';
import { SettingsView } from './components/SettingsView';
import { ItemModifierModal } from './components/ItemModifierModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ProductFormModal } from './components/ProductFormModal';
import { CloseShiftModal } from './components/CloseShiftModal';
import { formatRupiah } from './utils/formatters';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Transaction } from './types/pos';

const PosMainContent: React.FC = () => {
  const {
    activeTab,
    selectedProductForModifier,
    setSelectedProductForModifier,
    addToCart,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    completedTransaction,
    setCompletedTransaction,
    productModalOpen,
    setProductModalOpen,
    editingProduct,
    setEditingProduct,
    addProduct,
    updateProduct,
    cartTotal,
    cartItemCount,
  } = usePos();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);

  // Active view router
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'kasir':
        return (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
            {/* Middle: CartPanel (Ticket) */}
            <div className="hidden md:block h-full">
              <CartPanel onOpenPayment={() => setIsPaymentModalOpen(true)} />
            </div>

            {/* Right: KasirView (Product Catalog) */}
            <div className="flex-1 h-full overflow-hidden">
              <KasirView />
            </div>

            {/* Mobile Bottom Bar for Cart */}
            {cartItemCount > 0 && (
              <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-xl z-30">
                <button
                  onClick={() => setIsMobileCartOpen(true)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-between shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white text-emerald-700 font-extrabold text-xs flex items-center justify-center">
                      {cartItemCount}
                    </span>
                    <span className="text-xs font-semibold">Pesanan Aktif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">{formatRupiah(cartTotal)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            )}

            {/* Mobile Cart Bottom Sheet Drawer */}
            {isMobileCartOpen && (
              <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                  onClick={() => setIsMobileCartOpen(false)}
                />
                <div className="relative bg-white rounded-t-3xl max-h-[85vh] h-[85vh] flex flex-col z-10 shadow-2xl animate-in slide-in-from-bottom duration-200">
                  <div className="flex justify-center p-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CartPanel
                      onOpenPayment={() => {
                        setIsMobileCartOpen(false);
                        setIsPaymentModalOpen(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'riwayat':
        return (
          <SalesHistoryView
            onViewReceipt={(trx) => setCompletedTransaction(trx)}
          />
        );
      case 'stok':
        return <StockView />;
      case 'laporan':
        return <ReportsAnalyticsView />;
      case 'keuangan':
        return <FinanceView />;
      case 'absensi':
        return <AttendanceView />;
      case 'pengaturan':
        return <SettingsView />;
      default:
        return <KasirView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans">
      {/* Left Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenCloseShiftModal={() => setIsCloseShiftOpen(true)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header */}
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setIsMobileSidebarOpen(true);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 flex overflow-hidden">{renderActiveTab()}</main>
      </div>

      {/* 1. Item Modifier Modal */}
      {selectedProductForModifier && (
        <ItemModifierModal
          product={selectedProductForModifier}
          onClose={() => setSelectedProductForModifier(null)}
          onAddToCart={(product, qty, mods, notes, disc) => {
            addToCart(product, qty, mods, notes, disc);
          }}
        />
      )}

      {/* 2. Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={(trx: Transaction) => {
            setCompletedTransaction(trx);
          }}
        />
      )}

      {/* 3. Receipt Modal */}
      {completedTransaction && (
        <ReceiptModal
          isOpen={!!completedTransaction}
          transaction={completedTransaction}
          onClose={() => setCompletedTransaction(null)}
          onNewTransaction={() => setCompletedTransaction(null)}
        />
      )}

      {/* 4. Product Add / Edit Modal with Image Upload & URL */}
      {productModalOpen && (
        <ProductFormModal
          product={editingProduct}
          isOpen={productModalOpen}
          onClose={() => {
            setProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={(prodData) => {
            if (editingProduct) {
              updateProduct(editingProduct.id, prodData);
            } else {
              addProduct(prodData);
            }
          }}
        />
      )}

      {/* 5. Close Shift Modal */}
      {isCloseShiftOpen && (
        <CloseShiftModal
          isOpen={isCloseShiftOpen}
          onClose={() => setIsCloseShiftOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <PosProvider>
      <PosMainContent />
    </PosProvider>
  );
}
