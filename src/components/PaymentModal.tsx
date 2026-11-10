import React, { useState, useEffect } from 'react';
import { usePos } from '../context/PosContext';
import { PaymentMethod, Transaction } from '../types/pos';
import { formatRupiah } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  X,
  QrCode,
  Smartphone,
  Banknote,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cartTotal, cartSubtotal, cartTax, discountTotal, processPayment, customerName } =
    usePos();

  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('qris');
  const [cashAmount, setCashAmount] = useState<number>(cartTotal);
  const [ewalletPhone, setEwalletPhone] = useState<string>('081289123456');
  const [selectedEwallet, setSelectedEwallet] = useState<'gopay' | 'ovo' | 'dana' | 'shopeepay'>(
    'gopay'
  );
  const [selectedBank, setSelectedBank] = useState<'bca' | 'mandiri' | 'bri' | 'bni'>('bca');
  const [edcApprovalCode, setEdcApprovalCode] = useState<string>('892011');
  const [copiedVA, setCopiedVA] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCountdown, setQrCountdown] = useState<number>(900); // 15 mins

  // Countdown timer for QRIS
  useEffect(() => {
    if (!isOpen || activeMethod !== 'qris') return;
    const interval = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeMethod]);

  if (!isOpen) return null;

  const changeDue = Math.max(0, cashAmount - cartTotal);
  const isCashSufficient = cashAmount >= cartTotal;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const virtualAccountNumbers: Record<string, string> = {
    bca: '80777' + String(Date.now()).slice(-8),
    mandiri: '89102' + String(Date.now()).slice(-8),
    bri: '10293' + String(Date.now()).slice(-8),
    bni: '98801' + String(Date.now()).slice(-8),
  };

  const handleCompletePayment = (method: PaymentMethod, cashGiven?: number, ref?: string) => {
    setIsProcessing(true);

    // Simulate real-time digital transaction handshake
    setTimeout(() => {
      const trx = processPayment(method, cashGiven, ref);
      setIsProcessing(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
        });
      } catch {
        // ignore
      }

      onSuccess(trx);
      onClose();
    }, 600);
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(virtualAccountNumbers[selectedBank]);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Kasir Pembayaran Real-Time
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mt-0.5">
              Pilih Metode Pembayaran
            </h2>
          </div>

          <div className="text-right flex items-center gap-4">
            <div>
              <p className="text-[10px] font-medium text-gray-400">Total Tagihan</p>
              <p className="text-lg sm:text-xl font-black text-emerald-700">
                {formatRupiah(cartTotal)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 p-3 bg-gray-100/70 border-b border-gray-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMethod('qris')}
            className={`py-2 px-1.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
              activeMethod === 'qris'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-500/20'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">QRIS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMethod('gopay')}
            className={`py-2 px-1.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
              ['gopay', 'ovo', 'dana', 'shopeepay'].includes(activeMethod)
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-500/20'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">E-Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMethod('cash')}
            className={`py-2 px-1.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
              activeMethod === 'cash'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-500/20'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Tunai (Cash)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMethod('bca_va')}
            className={`py-2 px-1.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
              ['bca_va', 'mandiri_va'].includes(activeMethod)
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-500/20'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <Building className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Virtual Account</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMethod('debit_card')}
            className={`hidden sm:flex py-2 px-1.5 rounded-xl flex-col items-center gap-1 transition cursor-pointer ${
              activeMethod === 'debit_card'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-500/20'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Kartu EDC</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: QRIS DINAMIS REAL-TIME */}
          {activeMethod === 'qris' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>QRIS Dinamis Otomatis • Berlaku {formatTimer(qrCountdown)}</span>
              </div>

              {/* QR Code Container with official-style QRIS Header */}
              <div className="p-4 bg-white border-2 border-gray-200 rounded-3xl shadow-md max-w-[280px] w-full flex flex-col items-center">
                <div className="flex items-center justify-between w-full border-b pb-2 mb-2">
                  <span className="text-xs font-black tracking-widest text-red-600">QRIS</span>
                  <span className="text-[10px] text-gray-400">GPN • ASPI</span>
                </div>

                {/* Real Dynamic QR code SVG illustration */}
                <div className="p-2 bg-white rounded-xl border border-gray-100 my-1 relative">
                  <svg className="w-48 h-48" viewBox="0 0 200 200">
                    <rect width="200" height="200" fill="white" />
                    {/* Top Left Corner */}
                    <rect x="15" y="15" width="50" height="50" fill="#111827" rx="6" />
                    <rect x="25" y="25" width="30" height="30" fill="white" rx="4" />
                    <rect x="33" y="33" width="14" height="14" fill="#10b981" rx="2" />

                    {/* Top Right Corner */}
                    <rect x="135" y="15" width="50" height="50" fill="#111827" rx="6" />
                    <rect x="145" y="25" width="30" height="30" fill="white" rx="4" />
                    <rect x="153" y="33" width="14" height="14" fill="#10b981" rx="2" />

                    {/* Bottom Left Corner */}
                    <rect x="15" y="135" width="50" height="50" fill="#111827" rx="6" />
                    <rect x="25" y="145" width="30" height="30" fill="white" rx="4" />
                    <rect x="33" y="153" width="14" height="14" fill="#10b981" rx="2" />

                    {/* Data patterns */}
                    <rect x="75" y="20" width="12" height="12" fill="#1f2937" />
                    <rect x="95" y="25" width="12" height="12" fill="#1f2937" />
                    <rect x="115" y="35" width="10" height="10" fill="#1f2937" />

                    <rect x="75" y="45" width="12" height="12" fill="#1f2937" />
                    <rect x="92" y="55" width="14" height="14" fill="#10b981" />
                    <rect x="110" y="50" width="14" height="14" fill="#1f2937" />

                    <rect x="20" y="75" width="12" height="12" fill="#1f2937" />
                    <rect x="40" y="85" width="12" height="12" fill="#1f2937" />
                    <rect x="60" y="75" width="14" height="14" fill="#1f2937" />
                    <rect x="80" y="80" width="12" height="12" fill="#1f2937" />
                    <rect x="100" y="75" width="15" height="15" fill="#10b981" />
                    <rect x="125" y="80" width="12" height="12" fill="#1f2937" />
                    <rect x="145" y="75" width="12" height="12" fill="#1f2937" />
                    <rect x="165" y="85" width="15" height="15" fill="#1f2937" />

                    <rect x="75" y="105" width="14" height="14" fill="#1f2937" />
                    <rect x="95" y="115" width="12" height="12" fill="#1f2937" />
                    <rect x="115" y="105" width="14" height="14" fill="#1f2937" />

                    <rect x="75" y="135" width="12" height="12" fill="#1f2937" />
                    <rect x="95" y="145" width="12" height="12" fill="#1f2937" />
                    <rect x="115" y="135" width="12" height="12" fill="#1f2937" />
                    <rect x="135" y="140" width="15" height="15" fill="#10b981" />
                    <rect x="155" y="150" width="12" height="12" fill="#1f2937" />
                    <rect x="175" y="135" width="12" height="12" fill="#1f2937" />

                    {/* Nutapos center logo */}
                    <circle cx="100" cy="100" r="16" fill="white" />
                    <circle cx="100" cy="100" r="13" fill="#10b981" />
                    <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">n</text>
                  </svg>
                </div>

                <div className="mt-2 text-center w-full">
                  <p className="text-xs font-bold text-gray-800">PT Kopi Anak Bangsa</p>
                  <p className="text-[10px] text-gray-400">NMID: ID102026199201</p>
                  <p className="text-sm font-extrabold text-emerald-600 mt-1">
                    {formatRupiah(cartTotal)}
                  </p>
                </div>
              </div>

              {/* Status & Real-time Auto-Confirm Simulator */}
              <div className="w-full max-w-sm space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Mendeteksi pembayaran QRIS dari mobile banking pelanggan...</span>
                </div>

                <button
                  onClick={() =>
                    handleCompletePayment(
                      'qris',
                      cartTotal,
                      `QRIS-${Math.floor(100000 + Math.random() * 900000)}`
                    )
                  }
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-lime-300" />
                  <span>
                    {isProcessing
                      ? 'Memverifikasi Pembayaran...'
                      : 'Simulasi Bayar QRIS (Pelanggan Selesai Scan)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: E-WALLET (GOPAY, OVO, DANA, SHOPEEPAY) */}
          {['gopay', 'ovo', 'dana', 'shopeepay'].includes(activeMethod) && (
            <div className="space-y-4 max-w-md mx-auto">
              <label className="text-xs font-bold text-gray-700">Pilih Aplikasi E-Wallet:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'gopay', name: 'GoPay', color: 'border-cyan-400 bg-cyan-50 text-cyan-800' },
                  { id: 'ovo', name: 'OVO', color: 'border-purple-400 bg-purple-50 text-purple-800' },
                  { id: 'dana', name: 'DANA', color: 'border-blue-400 bg-blue-50 text-blue-800' },
                  { id: 'shopeepay', name: 'ShopeePay', color: 'border-orange-400 bg-orange-50 text-orange-800' },
                ].map((ew) => (
                  <button
                    key={ew.id}
                    type="button"
                    onClick={() => setSelectedEwallet(ew.id as typeof selectedEwallet)}
                    className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      selectedEwallet === ew.id
                        ? `${ew.color} ring-2 ring-emerald-500/30`
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {ew.name}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  Nomor HP Pelanggan Terdaftar
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400">
                    +62
                  </span>
                  <input
                    type="tel"
                    value={ewalletPhone}
                    onChange={(e) => setEwalletPhone(e.target.value)}
                    placeholder="81289123456"
                    className="w-full text-xs font-bold pl-12 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Notifikasi pembayaran push akan dikirim ke aplikasi ponsel pelanggan.
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Merchant</span>
                  <span className="font-bold text-gray-800">PT Kopi Anak Bangsa</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan</span>
                  <span className="font-bold text-gray-800">{customerName || 'Mira Workman'}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 font-bold text-emerald-800">
                  <span>Total Tagihan</span>
                  <span>{formatRupiah(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={() =>
                  handleCompletePayment(
                    selectedEwallet,
                    cartTotal,
                    `${selectedEwallet.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
                  )
                }
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isProcessing
                    ? 'Menunggu Konfirmasi Ponsel...'
                    : `Kirim Push Notification & Selesaikan Pembayaran`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 3: TUNAI / CASH */}
          {activeMethod === 'cash' && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Uang Diterima dari Pelanggan (IDR)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full text-xl font-black p-3 border-2 border-emerald-400 rounded-xl text-center bg-white focus:outline-emerald-500"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setCashAmount(cartTotal)}
                  className="py-2 px-2 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition cursor-pointer"
                >
                  Uang Pas
                </button>
                {[50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashAmount(amt)}
                    className="py-2 px-2 text-xs font-bold bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                  >
                    {formatRupiah(amt)}
                  </button>
                ))}
              </div>

              {/* Kembalian / Change calculation */}
              <div
                className={`p-4 rounded-2xl border text-center ${
                  isCashSufficient
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <p className="text-xs font-semibold">
                  {isCashSufficient ? 'Uang Kembalian (Change Due):' : 'Uang Masih Kurang:'}
                </p>
                <h3 className="text-2xl font-black mt-0.5">
                  {isCashSufficient ? formatRupiah(changeDue) : formatRupiah(cartTotal - cashAmount)}
                </h3>
              </div>

              <button
                onClick={() => handleCompletePayment('cash', cashAmount)}
                disabled={!isCashSufficient || isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Mencatat Transaksi...'
                    : `Selesaikan Pembayaran Tunai & Buka Laci Kas`}
                </span>
              </button>
            </div>
          )}

          {/* TAB 4: VIRTUAL ACCOUNT / TRANSFER BANK */}
          {['bca_va', 'mandiri_va'].includes(activeMethod) && (
            <div className="space-y-4 max-w-md mx-auto">
              <label className="text-xs font-bold text-gray-700">Pilih Bank Virtual Account:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'bca', name: 'BCA' },
                  { id: 'mandiri', name: 'Mandiri' },
                  { id: 'bri', name: 'BRI' },
                  { id: 'bni', name: 'BNI' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.id as typeof selectedBank)}
                    className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      selectedBank === b.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <p className="text-xs text-gray-500">Nomor Rekening Virtual Account ({selectedBank.toUpperCase()}):</p>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-300">
                  <span className="text-base font-black tracking-wider text-gray-800">
                    {virtualAccountNumbers[selectedBank]}
                  </span>
                  <button
                    onClick={handleCopyVA}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 text-xs font-bold cursor-pointer"
                  >
                    {copiedVA ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedVA ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Atas Nama: <strong className="text-gray-700">PT Kopi Anak Bangsa</strong>
                </p>
              </div>

              <button
                onClick={() =>
                  handleCompletePayment(
                    selectedBank === 'bca' ? 'bca_va' : 'mandiri_va',
                    cartTotal,
                    `VA-${virtualAccountNumbers[selectedBank]}`
                  )
                }
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isProcessing ? 'Mengecek Mutasi VA...' : 'Verifikasi Pembayaran Transfer Otomatis'}
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 5: KARTU DEBIT / EDC */}
          {activeMethod === 'debit_card' && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  Nomor Approval Code / Trace EDC Mesin
                </label>
                <input
                  type="text"
                  value={edcApprovalCode}
                  onChange={(e) => setEdcApprovalCode(e.target.value)}
                  placeholder="Contoh: 128941"
                  className="w-full text-sm font-bold p-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500"
                />
                <p className="text-[11px] text-gray-400">
                  Gesek atau tap kartu di mesin EDC kasir, lalu ketikkan kode approval pada struk EDC.
                </p>
              </div>

              <button
                onClick={() =>
                  handleCompletePayment('debit_card', cartTotal, `EDC-${edcApprovalCode}`)
                }
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Pembayaran Kartu EDC</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
