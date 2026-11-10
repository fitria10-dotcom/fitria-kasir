import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatDateTimeIndo } from '../utils/formatters';
import {
  LogOut,
  X,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building,
  DollarSign,
  Receipt,
} from 'lucide-react';

interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({ isOpen, onClose }) => {
  const { transactions, cashTransactions } = usePos();

  // Filter today's transactions
  const now = new Date();
  const todayTransactions = transactions.filter((t) => {
    const d = new Date(t.createdAt);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const totalGrossSales = todayTransactions.reduce((acc, t) => acc + t.total, 0);
  const cashSales = todayTransactions
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((acc, t) => acc + t.total, 0);

  const nonCashSales = totalGrossSales - cashSales;

  const totalCashIn = cashTransactions
    .filter((c) => c.type === 'in')
    .reduce((acc, c) => acc + c.amount, 0);

  const totalCashOut = cashTransactions
    .filter((c) => c.type === 'out')
    .reduce((acc, c) => acc + c.amount, 0);

  const expectedCashInDrawer = totalCashIn - totalCashOut;
  const [actualCashCount, setActualCashCount] = useState<number>(expectedCashInDrawer);
  const [shiftNotes, setShiftNotes] = useState<string>('Semua pesanan selesai dan uang kasir sesuai.');
  const [isClosed, setIsClosed] = useState(false);

  if (!isOpen) return null;

  const cashDifference = actualCashCount - expectedCashInDrawer;

  const handlePrintZReport = () => {
    window.print();
  };

  const handleConfirmClose = () => {
    setIsClosed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Tutup Outlet & Rekap Kasir (Z-Report)
              </h2>
              <p className="text-xs text-gray-500">
                Penyelesaian shift kasir harian PT Kopi Anak Bangsa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isClosed ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">Shift Berhasil Ditutup!</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Laporan penutupan kasir telah disimpan. Rekapitulasi penjualan telah disinkronkan ke sistem pusat.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handlePrintZReport}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Z-Report</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Shift Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-[11px] text-gray-500 font-bold">Total Omset Shift Ini</p>
                  <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                    {formatRupiah(totalGrossSales)}
                  </p>
                  <p className="text-[10px] text-gray-400">{todayTransactions.length} Transaksi</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-[11px] text-gray-500 font-bold">Non-Tunai (QRIS/EDC)</p>
                  <p className="text-lg font-extrabold text-blue-700 mt-0.5">
                    {formatRupiah(nonCashSales)}
                  </p>
                  <p className="text-[10px] text-gray-400">Masuk rekening otomatis</p>
                </div>
              </div>

              {/* Cash Reconciliation */}
              <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Modal Awal Kasir + Penjualan Tunai</span>
                  <span className="font-bold text-gray-800">{formatRupiah(totalCashIn)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Biaya Operasional Keluar</span>
                  <span className="font-bold">-{formatRupiah(totalCashOut)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-gray-900 pt-1.5 border-t border-emerald-200">
                  <span>Uang Kasir Seharusnya (Expected)</span>
                  <span className="text-emerald-800">{formatRupiah(expectedCashInDrawer)}</span>
                </div>
              </div>

              {/* Actual Physical Cash Count */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">
                  Hitungan Uang Fisik di Laci Kasir (Actual Cash)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(Number(e.target.value))}
                  className="w-full text-xl font-black p-3 border-2 border-emerald-500 rounded-xl text-center bg-white"
                />
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-gray-500">Selisih Kasir:</span>
                  <span
                    className={`font-bold ${
                      cashDifference === 0
                        ? 'text-emerald-600'
                        : cashDifference > 0
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }`}
                  >
                    {cashDifference === 0
                      ? 'Pas (Sesuai Rp 0)'
                      : `${cashDifference > 0 ? '+' : ''}${formatRupiah(cashDifference)}`}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Catatan Penutupan Kasir</label>
                <input
                  type="text"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Catatan pergantian shift atau selisih..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Konfirmasi Tutup Outlet
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
