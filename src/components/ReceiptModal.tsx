import React from 'react';
import { Transaction } from '../types/pos';
import { formatRupiah, formatDateTimeIndo } from '../utils/formatters';
import {
  Printer,
  Share2,
  Download,
  CheckCircle2,
  X,
  PlusCircle,
  Receipt as ReceiptIcon,
} from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onNewTransaction,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*STRUK PEMBELIAN - PT KOPI ANAK BANGSA*%0A` +
      `No. Nota: ${transaction.invoiceNo}%0A` +
      `Tanggal: ${formatDateTimeIndo(transaction.createdAt)}%0A` +
      `Pelanggan: ${transaction.customerName}%0A%0A` +
      transaction.items
        .map(
          (item) =>
            `- ${item.quantity}x ${item.name} = ${formatRupiah(item.subtotal)}`
        )
        .join('%0A') +
      `%0A%0A*Total: ${formatRupiah(transaction.total)}*%0A` +
      `Metode: ${transaction.paymentMethod.toUpperCase()}%0A` +
      `Terima kasih telah berkunjung!`;

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownload = () => {
    const content = `================================\n` +
      `      PT KOPI ANAK BANGSA       \n` +
      `   Jl. Jend. Sudirman Kav 52    \n` +
      `   Telp: 021-555-8910 / Jakarta \n` +
      `================================\n` +
      `No. Nota   : ${transaction.invoiceNo}\n` +
      `Waktu      : ${formatDateTimeIndo(transaction.createdAt)}\n` +
      `Kasir      : ${transaction.cashierName}\n` +
      `Pelanggan  : ${transaction.customerName}\n` +
      `Layanan    : ${transaction.diningOption.toUpperCase()} (${transaction.tableNumber || '-'})\n` +
      `--------------------------------\n` +
      transaction.items
        .map((it) => {
          let line = `${it.quantity}x ${it.name}`.padEnd(22) + formatRupiah(it.subtotal).padStart(10) + `\n`;
          it.selectedModifiers.forEach((m) => {
            line += `   + ${m.name} (${formatRupiah(m.price)})\n`;
          });
          if (it.notes) line += `   Catatan: ${it.notes}\n`;
          return line;
        })
        .join('') +
      `--------------------------------\n` +
      `Subtotal       : ${formatRupiah(transaction.subtotal)}\n` +
      (transaction.discountTotal > 0 ? `Diskon Nota    : -${formatRupiah(transaction.discountTotal)}\n` : '') +
      `PB1 (Pajak)    : ${formatRupiah(transaction.tax)}\n` +
      `Pembulatan     : ${formatRupiah(transaction.rounding)}\n` +
      `TOTAL AKHIR    : ${formatRupiah(transaction.total)}\n` +
      `--------------------------------\n` +
      `Metode Bayar   : ${transaction.paymentMethod.toUpperCase()}\n` +
      (transaction.cashGiven ? `Uang Diterima  : ${formatRupiah(transaction.cashGiven)}\n` : '') +
      (transaction.changeAmount ? `Kembalian      : ${formatRupiah(transaction.changeAmount)}\n` : '') +
      `Status         : LUNAS (BERHASIL)\n` +
      `================================\n` +
      ` Terima Kasih Atas Kunjungan Anda\n` +
      `   Powered by Nutapos Cloud POS \n` +
      `================================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Struk-${transaction.invoiceNo.replace(/\//g, '-')}.txt`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm font-bold">Transaksi Sukses!</h2>
              <p className="text-[11px] text-emerald-100">Struk digital siap dicetak atau dibagikan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Struk Paper Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 flex justify-center">
          <div
            id="printable-receipt"
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm w-full max-w-[320px] font-mono text-xs text-gray-800 space-y-3"
          >
            {/* Store details */}
            <div className="text-center space-y-0.5 border-b border-dashed border-gray-300 pb-3">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  n
                </div>
                <h3 className="font-sans font-black text-sm text-gray-900 tracking-tight">
                  nutapos
                </h3>
              </div>
              <h4 className="font-bold text-xs uppercase text-gray-900">PT Kopi Anak Bangsa</h4>
              <p className="text-[10px] text-gray-500">Jl. Jend. Sudirman Kav 52, Jakarta</p>
              <p className="text-[10px] text-gray-500">WhatsApp: 0812-8900-1122</p>
            </div>

            {/* Invoice meta */}
            <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-300 pb-2">
              <div className="flex justify-between">
                <span className="text-gray-500">No. Nota:</span>
                <span className="font-bold">{transaction.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Waktu:</span>
                <span>{formatDateTimeIndo(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kasir / Outlet:</span>
                <span>{transaction.cashierName} (Utama)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pelanggan:</span>
                <span className="font-bold">{transaction.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tipe Pesanan:</span>
                <span className="capitalize">{transaction.diningOption} ({transaction.tableNumber || '-'})</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 border-b border-dashed border-gray-300 pb-3">
              {transaction.items.map((item) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{formatRupiah(item.subtotal)}</span>
                  </div>
                  {item.selectedModifiers.map((mod, i) => (
                    <div key={i} className="flex justify-between text-[10px] text-gray-500 pl-3">
                      <span>+ {mod.name}</span>
                      <span>{mod.price > 0 ? formatRupiah(mod.price) : 'Rp 0'}</span>
                    </div>
                  ))}
                  {item.notes && (
                    <p className="text-[10px] text-gray-400 italic pl-3">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs border-b border-dashed border-gray-300 pb-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discountTotal > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Diskon Nota</span>
                  <span>-{formatRupiah(transaction.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>PB1 Restoran (10%)</span>
                <span>{formatRupiah(transaction.tax)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pembulatan</span>
                <span>{formatRupiah(transaction.rounding)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1 border-t border-gray-200">
                <span>TOTAL AKHIR</span>
                <span className="text-emerald-700">{formatRupiah(transaction.total)}</span>
              </div>
            </div>

            {/* Payment details */}
            <div className="text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Metode Bayar:</span>
                <span className="font-bold uppercase text-emerald-700">
                  {transaction.paymentMethod}
                </span>
              </div>
              {transaction.cashGiven !== undefined && transaction.cashGiven > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tunai Diterima:</span>
                    <span>{formatRupiah(transaction.cashGiven)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-500">Kembalian:</span>
                    <span>{formatRupiah(transaction.changeAmount || 0)}</span>
                  </div>
                </>
              )}
              {transaction.referenceCode && (
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Ref Trx:</span>
                  <span>{transaction.referenceCode}</span>
                </div>
              )}
            </div>

            {/* Footer QR & Message */}
            <div className="text-center pt-2 space-y-1 text-[10px] text-gray-400">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p className="font-medium text-gray-500">Barang yang sudah dibeli tidak dapat ditukar.</p>
              <p className="font-sans font-bold text-[9px] text-emerald-600 mt-1">
                NUTAPOS CLOUD SMART REGISTER
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleDownload}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Unduh TXT</span>
            </button>
          </div>

          <button
            onClick={onNewTransaction}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Selesai & Buka Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
