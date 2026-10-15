import { Search, SlidersHorizontal, ArrowUpRight, ArrowDownRight, KeyRound, XCircle } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Sistem Manajemen Calma</h1>
          <p className="text-xs text-gray-500 mt-1">Akses cepat kontrol administrasi, verifikasi praktisi, dan statistik platform.</p>
        </div>
        <div className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 font-medium shadow-sm">
          Sabtu, 20 Maret 2026
        </div>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] text-gray-400 font-medium">Total Pasien Aktif</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-serif font-bold text-slate-800">3,248</h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12.5%
            </span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] text-gray-400 font-medium">Dokter Terverifikasi</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-serif font-bold text-slate-800">84 Dokter</h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-full">
              ↑ 4 baru
            </span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] text-gray-400 font-medium">Konsultasi Bulan Ini</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-serif font-bold text-slate-800">1,420 Sesi</h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 18.2%
            </span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] text-gray-400 font-medium">Pendapatan Bulan Ini</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-serif font-bold text-slate-800">Rp 148.5M</h2>
            <span className="text-[10px] bg-rose-50 text-rose-500 font-bold px-2 py-0.5 rounded-full flex items-center">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> 2.4%
            </span>
          </div>
        </div>
      </div>

      {/* Table Management View */}
      <UserManagementTable />
    </div>
  );
}

function UserManagementTable() {
  const users = [
    { name: "Dr. Adrian Hartanto, Sp.KJ", email: "adrian.hartanto@calma.com", role: "Dokter", status: "Terverifikasi", date: "12 Jan 2026" },
    { name: "Laras Kirana", email: "laras.kirana@email.com", role: "Pasien", status: "Terverifikasi", date: "20 Feb 2026" },
    { name: "Dr. Farida Utama, Sp.KJ", email: "farida.utama@calma.com", role: "Dokter", status: "Terverifikasi", date: "05 Feb 2026" },
    { name: "Rian Anggoro", email: "rian.anggoro@email.com", role: "Pasien", status: "Pending", date: "18 Mar 2026" },
    { name: "Dr. Hendra Wijaya, Sp.KJ", email: "hendra.w@calma.com", role: "Dokter", status: "Pending", date: "19 Mar 2026" },
    { name: "Jessica Mila", email: "jessica.mila@email.com", role: "Pasien", status: "Ditolak", date: "02 Mar 2026" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Manajemen Pengguna</h3>
          <p className="text-xs text-gray-400">Kelola hak akses pasien, dokter, serta status verifikasi klinis mereka</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Cari nama atau email..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-gray-200 rounded-xl outline-none" />
          </div>
          <button className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl text-gray-600 hover:bg-stone-50">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <th className="py-3">Nama & Email</th>
            <th className="py-3">Peran</th>
            <th className="py-3">Status Verifikasi</th>
            <th className="py-3">Tanggal Bergabung</th>
            <th className="py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-xs">
          {users.map((row, idx) => (
            <tr key={idx} className="hover:bg-stone-50/50 transition">
              <td className="py-3.5">
                <div className="font-bold text-slate-800">{row.name}</div>
                <div className="text-[11px] text-gray-400">{row.email}</div>
              </td>
              <td className="py-3.5">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${row.role === 'Dokter' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {row.role}
                </span>
              </td>
              <td className="py-3.5">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                  row.status === 'Terverifikasi' ? 'bg-stone-100 text-stone-600' :
                  row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'
                }`}>
                  {row.status}
                </span>
              </td>
              <td className="py-3.5 text-gray-500">{row.date}</td>
              <td className="py-3.5 text-right">
                <div className="flex justify-end space-x-1.5">
                  <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-stone-100 text-gray-600"><KeyRound className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-rose-50 text-rose-500"><XCircle className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center pt-4 text-xs text-gray-400">
        <span>Menampilkan 1-6 dari 1,248 pengguna</span>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-stone-50">Sebelumnya</button>
          <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-stone-50">Selanjutnya</button>
        </div>
      </div>
    </div>
  );
}