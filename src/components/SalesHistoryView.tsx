import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { Transaction } from '../types/pos';
import { formatRupiah, formatDateTimeIndo } from '../utils/formatters';
import {
  Receipt,
  Search,
  Printer,
  Eye,
  Filter,
  CheckCircle2,
  Calendar,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';

interface SalesHistoryViewProps {
  onViewReceipt: (trx: Transaction) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ onViewReceipt }) => {
  const { transactions } = usePos();
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [transactions, searchQuery, methodFilter]);

  const totalFilteredSales = filteredTransactions.reduce((acc, t) => acc + t.total, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Riwayat Penjualan & Struk
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftar lengkap transaksi nota penjualan, status pembayaran, dan cetak ulang struk thermal.
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-xs text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Penjualan Tercatat</p>
          <p className="text-base sm:text-lg font-black text-emerald-700">
            {formatRupiah(totalFilteredSales)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor nota atau nama pelanggan..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs font-semibold p-2 border border-gray-200 rounded-xl bg-white focus:outline-emerald-500"
          >
            <option value="all">Semua Metode Pembayaran</option>
            <option value="qris">QRIS Real-Time</option>
            <option value="cash">Tunai (Cash)</option>
            <option value="gopay">GoPay</option>
            <option value="dana">DANA</option>
            <option value="bca_va">BCA Virtual Account</option>
            <option value="debit_card">Kartu EDC / Debit</option>
          </select>
        </div>
      </div>

      {/* Table of Transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">No. Nota</th>
                <th className="py-3.5 px-4">Waktu Transaksi</th>
                <th className="py-3.5 px-4">Pelanggan & Meja</th>
                <th className="py-3.5 px-4">Item Dipesan</th>
                <th className="py-3.5 px-3">Metode Bayar</th>
                <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                    {trx.invoiceNo}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {formatDateTimeIndo(trx.createdAt)}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-gray-900">{trx.customerName}</p>
                    <p className="text-[11px] text-gray-400 capitalize">
                      {trx.diningOption} • {trx.tableNumber || '-'}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                      {trx.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-semibold text-gray-700"
                        >
                          {it.quantity}x {it.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 rounded-md">
                      {trx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-700 font-mono text-sm">
                    {formatRupiah(trx.total)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Lunas
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onViewReceipt(trx)}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Lihat Struk</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-xs">
            Tidak ada transaksi ditemukan yang sesuai dengan pencarian Anda.
          </div>
        )}
      </div>
    </div>
  );
};
