"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, KeyRound, XCircle, Loader2 } from "lucide-react";

interface UserData {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function untuk fetch data dari backend FastAPI
  const fetchUsers = async (searchQuery = "") => {
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");

      const res = await fetch(`${apiUrl}/api/admin/users?search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data pengguna dari server.");
      }

      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Manajemen Pengguna
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola hak akses pasien, dokter, serta status verifikasi klinis mereka dari database.
          </p>
        </div>
      </div>

      {/* Tabel Utama */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs bg-teal-800 text-white rounded-xl hover:bg-teal-900 transition"
            >
              <span>Cari</span>
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-teal-700" />
              <p className="text-xs">Memuat data dari database...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              Tidak ada data pengguna yang ditemukan.
            </div>
          ) : (
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
                {users.map((row) => {
                  const roleFormatted = row.role.toUpperCase();
                  return (
                    <tr key={row.id} className="hover:bg-stone-50/50 transition">
                      <td className="py-3.5">
                        <div className="font-bold text-slate-800">{row.full_name}</div>
                        <div className="text-[11px] text-gray-400">{row.email}</div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                            roleFormatted === "DOCTOR"
                              ? "bg-sky-50 text-sky-600"
                              : roleFormatted === "ADMIN"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {roleFormatted}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-600">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-500">{row.created_at}</td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end space-x-1.5">
                          <button
                            title="Reset Akses/Sandi"
                            className="p-1.5 border border-gray-200 rounded-lg hover:bg-stone-100 text-gray-600 transition"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Nonaktifkan Pengguna"
                            className="p-1.5 border border-gray-200 rounded-lg hover:bg-rose-50 text-rose-500 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 text-xs text-gray-400 gap-3">
          <span>Menampilkan {users.length} pengguna</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-stone-50 transition">
              Sebelumnya
            </button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-stone-50 transition">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}