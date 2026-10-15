"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  DollarSign
} from "lucide-react";
import { firebaseService } from "@/lib/firebase";

interface PayoutRequest {
  id: number;
  doctor_id: number;
  doctor_name: string;
  doctor_specialty: string;
  bank_name: string;
  account_number: string;
  amount: number;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export default function LaporanKeuanganPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);

  // Total Alokasi Payout Dokter Awal Platform (80% dari Rp 148.500.000)
  const INITIAL_DOCTOR_PAYOUT_POOL = 118800000;

  // Fetch data pengajuan pencairan asli dari Firebase Realtime Database
  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.getPayouts();
      if (data) {
        setPayoutRequests(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data payout dari Firebase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  // Hitung total nominal pengajuan yang berstatus "pending" (Menunggu ACC)
  const totalPending = payoutRequests
    .filter((r) => r.status === "pending")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Hitung total nominal pencairan yang sudah di-ACC ("approved")
  const totalApproved = payoutRequests
    .filter((r) => r.status === "approved")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Sisa Payout Dokter (80%) yang belum dicairkan platform (Otomatis Berkurang Hingga Rp 0 saat di-ACC)
  const remainingDoctorPayoutPool = Math.max(0, INITIAL_DOCTOR_PAYOUT_POOL - totalApproved);

  // Admin Menyetujui (ACC) Pencairan
  const handleApprovePayout = async (id: number) => {
    if (!confirm("Setujui (ACC) pencairan ini? Dana akan ditransfer ke rekening dokter.")) return;

    setIsProcessing(id);

    try {
      await firebaseService.updatePayoutStatus(id, "approved");

      setPayoutRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req))
      );
      alert("Pengajuan pencairan berhasil di-ACC!");
    } catch (err: any) {
      console.error("Gagal ACC payout:", err);
      alert(`Gagal memproses persetujuan: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  // Admin Menolak Pengajuan
  const handleRejectPayout = async (id: number) => {
    if (!confirm("Tolak pengajuan pencairan dana ini?")) return;

    setIsProcessing(id);

    try {
      await firebaseService.updatePayoutStatus(id, "rejected");

      setPayoutRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req))
      );
    } catch (err: any) {
      console.error("Gagal menolak payout:", err);
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredRequests = payoutRequests.filter((req) => {
    const matchesSearch =
      (req.doctor_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.bank_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(req.id).includes(searchQuery);

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && req.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 font-sans text-slate-800 bg-slate-50/50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Keuangan & Bagi Hasil
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Laporan Keuangan Platform</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau performa bisnis, komisi platform, dan kelola persetujuan pencairan dana (*payout*) mitra dokter.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-2xl text-xs font-semibold border border-emerald-100/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Sistem Gateway Terintegrasi
        </div>
      </div>

      {/* Ringkasan Keuangan Platform */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-teal-400 tracking-wider uppercase">Total Pendapatan Kotor</span>
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <TrendingUp className="w-4 h-4 text-teal-300" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Rp 148.500.000</h2>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> +12.5% dari bulan lalu
            </p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Komisi Calma (20%)</span>
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Rp 29.700.000</h2>
            <p className="text-[11px] text-teal-600 font-medium mt-1">Pendapatan bersih platform</p>
          </div>
        </div>

        {/* CARD PAYOUT DOKTER (80%) - Otomatis Berkurang Hingga Rp 0 saat di-ACC */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Payout Dokter (80%)</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rp {remainingDoctorPayoutPool.toLocaleString("id-ID")}
            </h2>
            <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Rp {totalPending.toLocaleString("id-ID")} Menunggu ACC
            </p>
          </div>
        </div>
      </div>

      {/* Tabel ACC Pengajuan Pencairan */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-600" /> Daftar Pengajuan Pencairan Mitra Dokter
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">ACC pengajuan agar dana langsung ditransfer otomatis ke rekening tujuan dokter.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama / bank / ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600 transition-all"
              />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                Menunggu
              </button>
              <button
                onClick={() => setFilterStatus("approved")}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "approved" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                Disetujui
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-4">ID & Tanggal</th>
                <th className="px-5 py-4">Dokter (ID User)</th>
                <th className="px-5 py-4">Rekening Tujuan</th>
                <th className="px-5 py-4">Jumlah Penarikan</th>
                <th className="px-5 py-4">Status Transaksi</th>
                <th className="px-5 py-4 text-center">Aksi Admin (ACC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-teal-600 mb-1" />
                    Memuat data pengajuan...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    Tidak ada data pengajuan pencairan dana.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 block">PO-#{req.id}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(req.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 block">{req.doctor_name}</span>
                      <span className="text-[10px] text-slate-500">ID Dokter: {req.doctor_id} • {req.doctor_specialty}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800 block">{req.bank_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono tracking-wider">{req.account_number}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-extrabold text-teal-800 text-sm">
                        Rp {Number(req.amount).toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {req.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200">
                          <Clock className="w-3 h-3" /> Menunggu ACC
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Berhasil Ditransfer
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold border border-rose-200">
                          <XCircle className="w-3 h-3" /> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {req.status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprovePayout(req.id)}
                            disabled={isProcessing === req.id}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all"
                          >
                            {isProcessing === req.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" /> ACC & Transfer
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectPayout(req.id)}
                            disabled={isProcessing === req.id}
                            className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-all"
                          >
                            <X className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium italic">Selesai Diproses</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}