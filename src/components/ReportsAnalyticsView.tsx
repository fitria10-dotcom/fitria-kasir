import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  Download,
  Calendar,
  Award,
  CreditCard,
  PieChart as PieIcon,
  BarChart2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ReportsAnalyticsView: React.FC = () => {
  const { transactions, products } = usePos();

  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | '30days' | 'all'>('7days');

  // Filter transactions based on date
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((trx) => {
      const trxDate = new Date(trx.createdAt);
      if (dateFilter === 'today') {
        return (
          trxDate.getDate() === now.getDate() &&
          trxDate.getMonth() === now.getMonth() &&
          trxDate.getFullYear() === now.getFullYear()
        );
      }
      if (dateFilter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return (
          trxDate.getDate() === yesterday.getDate() &&
          trxDate.getMonth() === yesterday.getMonth() &&
          trxDate.getFullYear() === yesterday.getFullYear()
        );
      }
      if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
        return trxDate >= sevenDaysAgo;
      }
      if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
        return trxDate >= thirtyDaysAgo;
      }
      return true;
    });
  }, [transactions, dateFilter]);

  // Aggregate Metrics
  const grossSales = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalCost = filteredTransactions.reduce((acc, t) => acc + (t.totalCost || t.subtotal * 0.5), 0);
  const grossProfit = Math.max(0, grossSales - totalCost);
  const profitMargin = grossSales > 0 ? (grossProfit / grossSales) * 100 : 0;
  const transactionCount = filteredTransactions.length;
  const avgOrderValue = transactionCount > 0 ? grossSales / transactionCount : 0;

  // Best Selling Products Aggregation
  const bestSellers = useMemo(() => {
    const map = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
    filteredTransactions.forEach((trx) => {
      trx.items.forEach((item) => {
        const existing = map.get(item.name) || {
          name: item.name,
          image: item.image,
          qty: 0,
          revenue: 0,
        };
        existing.qty += item.quantity;
        existing.revenue += item.subtotal;
        map.set(item.name, existing);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [filteredTransactions]);

  // Payment Methods Breakdown
  const paymentBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      qris: 0,
      cash: 0,
      ewallet: 0,
      va: 0,
      card: 0,
    };
    filteredTransactions.forEach((t) => {
      if (t.paymentMethod === 'qris') counts.qris += t.total;
      else if (t.paymentMethod === 'cash') counts.cash += t.total;
      else if (['gopay', 'ovo', 'dana', 'shopeepay'].includes(t.paymentMethod)) counts.ewallet += t.total;
      else if (['bca_va', 'mandiri_va'].includes(t.paymentMethod)) counts.va += t.total;
      else counts.card += t.total;
    });
    return counts;
  }, [filteredTransactions]);

  // Hourly Peak Times
  const hourlyData = useMemo(() => {
    const hours = Array(15).fill(0); // 08:00 to 22:00
    filteredTransactions.forEach((t) => {
      const h = new Date(t.createdAt).getHours();
      if (h >= 8 && h <= 22) {
        hours[h - 8] += t.total;
      }
    });
    return hours;
  }, [filteredTransactions]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'No. Nota',
      'Tanggal Transaksi',
      'Pelanggan',
      'Layanan',
      'Metode Bayar',
      'Subtotal',
      'Pajak',
      'Diskon',
      'Total Akhir',
    ];
    const rows = filteredTransactions.map((t) => [
      t.invoiceNo,
      t.createdAt,
      `"${t.customerName}"`,
      t.diningOption,
      t.paymentMethod.toUpperCase(),
      t.subtotal,
      t.tax,
      t.discountTotal,
      t.total,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan-Penjualan-Nutapos-${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxHourly = Math.max(...hourlyData, 1);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* 1. Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Laporan Penjualan Otomatis & Analitik Performa
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Pantau omset harian, keuntungan kotor, jam operasional tersibuk, dan tren menu terlaris secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range filter buttons */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-xs text-xs font-semibold">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                dateFilter === 'today' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                dateFilter === 'yesterday' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kemarin
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                dateFilter === '7days' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                dateFilter === '30days' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              30 Hari
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Omset */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 truncate">
            {formatRupiah(grossSales)}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Omset Penjualan Bersih</span>
          </p>
        </div>

        {/* Laba Kotor (Gross Profit) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Estimasi Laba Kotor</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-blue-700 truncate">
            {formatRupiah(grossProfit)}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            Margin: <strong className="text-blue-700">{Math.round(profitMargin)}%</strong> dari total omset
          </p>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Transaksi</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">
            {transactionCount} <span className="text-xs font-bold text-gray-400">Nota</span>
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Struk tercatat berhasil</p>
        </div>

        {/* Rata-rata Keranjang (AOV) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Rata-rata Nota</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-800 truncate">
            {formatRupiah(avgOrderValue)}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Rata-rata per pelanggan</p>
        </div>
      </div>

      {/* 3. Charts Grid: Hourly Peak Time & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Peak Time Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Grafik Jam Sibuk Operasional (08:00 - 22:00)
              </h3>
            </div>
            <span className="text-xs text-gray-400">Total Transaksi Harian</span>
          </div>

          {/* Responsive SVG / CSS Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-1 pt-6 px-2 border-b border-gray-100">
            {hourlyData.map((val, idx) => {
              const hourLabel = `${String(idx + 8).padStart(2, '0')}:00`;
              const heightPct = Math.max(10, Math.round((val / maxHourly) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                    {hourLabel}: {formatRupiah(val)}
                  </div>

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                      val > 0
                        ? 'bg-gradient-to-t from-emerald-600 to-lime-400 group-hover:from-emerald-700 group-hover:to-lime-500'
                        : 'bg-gray-100'
                    }`}
                  />
                  <span className="text-[10px] text-gray-400 font-mono scale-90">
                    {idx % 2 === 0 ? idx + 8 : ''}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 text-center">
            Puncak transaksi terjadi pada jam makan siang (12:00-14:00) dan malam hari (18:00-20:00).
          </p>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">Metode Pembayaran</h3>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'QRIS Real-Time', val: paymentBreakdown.qris, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Tunai (Cash)', val: paymentBreakdown.cash, color: 'bg-amber-500', bg: 'bg-amber-50' },
              { label: 'E-Wallet (GoPay, DANA)', val: paymentBreakdown.ewallet, color: 'bg-blue-500', bg: 'bg-blue-50' },
              { label: 'Virtual Account (VA)', val: paymentBreakdown.va, color: 'bg-purple-500', bg: 'bg-purple-50' },
              { label: 'Kartu EDC / Debit', val: paymentBreakdown.card, color: 'bg-slate-500', bg: 'bg-slate-50' },
            ].map((m) => {
              const pct = grossSales > 0 ? Math.round((m.val / grossSales) * 100) : 0;
              return (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>{m.label}</span>
                    <span className="font-bold">{formatRupiah(m.val)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${m.color} transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Best Selling Products Table with Photos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-900">
              Peringkat Menu Makanan & Minuman Terlaris (Best Seller)
            </h3>
          </div>
          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Top Kontributor Omset
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Menu & Foto</th>
                <th className="py-3 px-4 text-center">Porsi Terjual</th>
                <th className="py-3 px-4 text-right">Total Pendapatan</th>
                <th className="py-3 px-4 text-center">Kontribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {bestSellers.map((item, idx) => {
                const sharePct = grossSales > 0 ? Math.round((item.revenue / grossSales) * 100) : 0;
                return (
                  <tr key={item.name} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-800'
                            : idx === 1
                            ? 'bg-gray-200 text-gray-700'
                            : idx === 2
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                      <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900">
                      {item.qty} porsi
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                      {formatRupiah(item.revenue)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-xs">{sharePct}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            style={{ width: `${sharePct}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
