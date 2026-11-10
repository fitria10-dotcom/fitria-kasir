import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import {
  Settings,
  Store,
  Receipt,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Percent,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    taxRate,
    setTaxRate,
    soundEnabled,
    toggleSound,
    resetDataToDefaults,
  } = usePos();

  const [outletName, setOutletName] = useState('PT Kopi Anak Bangsa');
  const [outletAddress, setOutletAddress] = useState('Jl. Jend. Sudirman Kav 52, Jakarta');
  const [outletPhone, setOutletPhone] = useState('021-555-8910');
  const [receiptFooter, setReceiptFooter] = useState('Terima kasih atas kunjungan Anda!');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Pengaturan Outlet & Sistem POS
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Konfigurasi identitas toko, pajak restoran PB1, format struk, dan preferensi aplikasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Profile Form */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Store className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900">Profil Outlet & Struk</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Nama Bisnis / Toko</label>
              <input
                type="text"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 border border-gray-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Alamat Outlet</label>
              <input
                type="text"
                value={outletAddress}
                onChange={(e) => setOutletAddress(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={outletPhone}
                onChange={(e) => setOutletPhone(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Pesan Kaki Struk (Receipt Footer)</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Profil Outlet</span>
            </button>
            {isSaved && (
              <p className="text-center text-xs font-bold text-emerald-600">
                Pengaturan berhasil diperbarui!
              </p>
            )}
          </form>
        </div>

        {/* System & Tax Preferences */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Percent className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">Pajak & Kebijakan Kasir</h3>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-xs font-bold text-gray-800">Pajak Restoran PB1 (10%)</p>
                <p className="text-[11px] text-gray-400">
                  Dikenakan otomatis pada setiap nota penjualan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTaxRate(taxRate > 0 ? 0 : 0.1)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  taxRate > 0 ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    taxRate > 0 ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-gray-800">Efek Suara Kasir</p>
                <p className="text-[11px] text-gray-400">
                  Bunyi beep saat memilih menu dan nada dering saat transaksi lunas
                </p>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  soundEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Reset Data Demo Sistem</span>
            </h3>
            <p className="text-xs text-gray-500">
              Kembalikan semua daftar menu, foto makanan, riwayat transaksi, dan stok inventaris ke pengaturan awal bawaan mockup.
            </p>
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi default awal?')) {
                  resetDataToDefaults();
                  alert('Data aplikasi berhasil dikembalikan ke kondisi awal!');
                }
              }}
              className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition cursor-pointer"
            >
              Reset ke Data Bawaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
