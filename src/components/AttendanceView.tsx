import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { formatDateTimeIndo } from '../utils/formatters';
import { Users, Clock, CheckCircle2, UserCheck, Plus, LogOut } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { attendances, addAttendance, clockOutAttendance } = usePos();
  const [staffName, setStaffName] = useState('');
  const [role, setRole] = useState('Kasir');
  const [showModal, setShowModal] = useState(false);

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;
    addAttendance(staffName.trim(), role);
    setStaffName('');
    setShowModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Absensi Staf & Jadwal Shift
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Presensi masuk/keluar kasir dan staf operasional outlet PT Kopi Anak Bangsa.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Clock In / Absen Masuk Staf</span>
        </button>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Daftar Kehadiran Shift Hari Ini</h3>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            {attendances.filter((a) => a.status === 'present').length} Staf Sedang Bertugas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Nama Staf</th>
                <th className="py-3 px-4">Jabatan / Posisi</th>
                <th className="py-3 px-4">Waktu Masuk (Clock In)</th>
                <th className="py-3 px-4">Waktu Pulang (Clock Out)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {attendances.map((att) => (
                <tr key={att.id} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {att.staffName.charAt(0)}
                    </div>
                    <span>{att.staffName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{att.role}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-800">
                    {formatDateTimeIndo(att.clockIn)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">
                    {att.clockOut ? formatDateTimeIndo(att.clockOut) : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {att.status === 'present' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Aktif Bertugas
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-full">
                        Shift Selesai
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {att.status === 'present' ? (
                      <button
                        onClick={() => clockOutAttendance(att.id)}
                        className="px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Clock Out</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400">Tercatat</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clock In Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 mb-3">Absen Masuk (Clock In)</h3>
            <form onSubmit={handleClockIn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Nama Lengkap Karyawan</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Contoh: Rendi / Sarah"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Posisi / Shift</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-300 rounded-xl bg-white"
                >
                  <option value="Kasir Utama">Kasir Utama</option>
                  <option value="Barista / Minuman">Barista / Minuman</option>
                  <option value="Koki / Dapur">Koki / Dapur</option>
                  <option value="Pelayan / Server">Pelayan / Server</option>
                  <option value="Supervisor Outlet">Supervisor Outlet</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan Clock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
