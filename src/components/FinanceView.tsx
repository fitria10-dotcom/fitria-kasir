import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatDateTimeIndo } from '../utils/formatters';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Coins,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { cashTransactions, addCashTransaction, transactions } = usePos();

  const [type, setType] = useState<'in' | 'out'>('out');
  const [category, setCategory] = useState<string>('Biaya Operasional');
  const [amount, setAmount] = useState<number>(50000);
  const [description, setDescription] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Total cash in drawer
  const totalCashSales = transactions
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((acc, t) => acc + t.total, 0);

  const totalOtherCashIn = cashTransactions
    .filter((c) => c.type === 'in')
    .reduce((acc, c) => acc + c.amount, 0);

  const totalCashOut = cashTransactions
    .filter((c) => c.type === 'out')
    .reduce((acc, c) => acc + c.amount, 0);

  const currentDrawerCashBalance = totalOtherCashIn - totalCashOut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    addCashTransaction(type, category, amount, description || 'Transaksi kas manual');
    setShowAddModal(false);
    setDescription('');
    setAmount(50000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Keuangan & Arus Kas Kasir
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Pencatatan kas masuk modal awal, pengeluaran operasional toko harian, dan saldo laci kasir real-time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Catat Kas Masuk / Keluar</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Saldo Laci Kasir Saat Ini</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-700">
            {formatRupiah(currentDrawerCashBalance)}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Uang fisik tersedia di kasir</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Total Penjualan Tunai</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">{formatRupiah(totalCashSales)}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Masuk otomatis via POS</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Total Pengeluaran Kas</span>
            <ArrowUpRight className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-red-600">{formatRupiah(totalCashOut)}</h3>
          <p className="text-[11px] text-gray-400 mt-1">Biaya operasional & belanja</p>
        </div>
      </div>

      {/* Cash Journal Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Jurnal Mutasi Kas Harian</h3>
          <span className="text-xs text-gray-400">{cashTransactions.length} Catatan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Jenis Kas</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Deskripsi / Keperluan</th>
                <th className="py-3 px-4 text-right">Jumlah</th>
                <th className="py-3 px-4 text-right">Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {cashTransactions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-mono text-gray-500">
                    {formatDateTimeIndo(c.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    {c.type === 'in' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 rounded-md inline-flex items-center gap-1">
                        <ArrowDownLeft className="w-3 h-3" />
                        Kas Masuk
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-800 rounded-md inline-flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        Kas Keluar
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-800">{c.category}</td>
                  <td className="py-3 px-4 text-gray-600">{c.description}</td>
                  <td
                    className={`py-3 px-4 text-right font-black font-mono text-sm ${
                      c.type === 'in' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {c.type === 'in' ? '+' : '-'} {formatRupiah(c.amount)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500 font-semibold">
                    {c.cashierName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Cash Transaction */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 mb-3">Catat Kas Masuk / Keluar</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setType('in')}
                  className={`py-2 rounded-lg transition ${
                    type === 'in' ? 'bg-emerald-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Kas Masuk (Tambah)
                </button>
                <button
                  type="button"
                  onClick={() => setType('out')}
                  className={`py-2 rounded-lg transition ${
                    type === 'out' ? 'bg-red-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Kas Keluar (Biaya)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-300 rounded-xl bg-white"
                >
                  {type === 'in' ? (
                    <>
                      <option value="Modal Awal Kasir">Modal Awal Kasir</option>
                      <option value="Penambahan Kas">Penambahan Kas Darurat</option>
                      <option value="Penerimaan Lainnya">Penerimaan Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Biaya Operasional">Biaya Operasional Toko</option>
                      <option value="Belanja Bahan Baku Darurat">Belanja Bahan Baku Darurat</option>
                      <option value="Konsumsi Karyawan">Konsumsi Karyawan</option>
                      <option value="Beban Listrik / Air / Gas">Beban Listrik / Air / Gas</option>
                      <option value="Setor Tunai ke Bank">Setor Tunai ke Bank</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Nominal Kas (IDR)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-lg font-black p-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Keterangan Tambahan</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Beli es batu kristal 2 karung"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan Mutasi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
