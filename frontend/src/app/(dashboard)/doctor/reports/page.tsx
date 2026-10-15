"use client";

import { useState, useEffect } from "react";
import { CreditCard, Users, Star, Loader2, PlusCircle } from "lucide-react";
import { firebaseService } from "@/lib/firebase";

export default function DoctorReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<{ id: number; name: string } | null>(null);

  // State input nominal pencairan fleksibel
  const [customAmount, setCustomAmount] = useState<string>("1000000");

  // State riwayat pencairan dari Firebase Realtime Database
  const [payoutsList, setPayoutsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchDoctorDataAndReports = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const token = localStorage.getItem("doctor_token") || localStorage.getItem("token");

        let docId = 6; // Default ID dokter (Dr. Danuar Ilham)
        let docName = "Danuar Ilham";

        // 1. Fetch Profil Dokter
        if (token) {
          const profileRes = await fetch(`${apiUrl}/api/doctor/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const pData = await profileRes.json();
            if (pData.id) docId = Number(pData.id);
            if (pData.full_name) docName = pData.full_name;
          }
        }
        setCurrentDoctor({ id: docId, name: docName });

        // 2. Fetch Report Kinerja Dokter
        const res = await fetch(`${apiUrl}/api/doctor/reports`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        } else {
          setReport({
            initial_honor: 14850000, // Total Honor Awal Kotor/Bersih Bulan Ini
            total_sessions: "98 Sesi Selesai",
            satisfaction_rating: "4.92 / 5.00"
          });
        }

        // 3. Fetch Seluruh Riwayat Pencairan dari Firebase Realtime Database
        const payoutsData = await firebaseService.getPayouts(docId);
        if (payoutsData) {
          setPayoutsList(payoutsData);
        }
      } catch (error) {
        console.error("Gagal memuat data dokter/payout:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDataAndReports();
  }, []);

  // Hitung total nominal yang sudah dicairkan atau sedang diproses (pending & approved)
  const totalDrawn = payoutsList
    .filter((p) => p.status === "pending" || p.status === "approved")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // Total Honor Awal Bulan Ini (Default Rp 14.850.000)
  const initialHonor = report?.initial_honor || 14850000;

  // Hitung Sisa Estimasi Honor Bulan Ini secara Otomatis
  const currentHonorBalance = Math.max(0, initialHonor - totalDrawn);

  // Fungsi Dokter Mengajukan Pencairan Dana
  const handleRequestPayout = async () => {
    if (!currentDoctor) return;
    const numericAmount = Number(customAmount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Masukkan nominal pencairan yang valid.");
      return;
    }

    if (numericAmount > currentHonorBalance) {
      alert(`Nominal melebihi sisa honor yang tersedia (Sisa Honor: Rp ${currentHonorBalance.toLocaleString("id-ID")})`);
      return;
    }

    if (!confirm(`Ajukan pencairan dana sebesar Rp ${numericAmount.toLocaleString("id-ID")} ke rekening bank Anda?`)) return;

    setIsSubmittingPayout(true);
    try {
      const data = await firebaseService.createPayout({
        doctor_id: currentDoctor.id,
        doctor_name: currentDoctor.name,
        doctor_specialty: "Psikiatri Dewasa",
        bank_name: "Bank Mandiri",
        account_number: "1380029381029",
        amount: numericAmount,
        status: "pending"
      });

      alert("Pengajuan pencairan dana berhasil dikirim ke Admin!");
      setPayoutsList((prev) => [data, ...prev]);
      setCustomAmount("1000000"); // Reset nilai input
    } catch (err: any) {
      console.error("Gagal mengajukan pencairan via Firebase:", err);
      alert(`Terjadi kesalahan: ${err.message || "Gagal mengajukan pencairan."}`);
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-teal-800 mb-2" />
        <span className="text-xs">Memuat Laporan Kinerja...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-slate-800 p-4 sm:p-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Analitik & Laporan Kinerja</h1>
          <p className="text-xs text-gray-500 mt-1">
            Evaluasi data perkembangan sesi Anda, total kepuasan pasien, serta rekapitulasi estimasi honor praktik.
          </p>
        </div>
        <select className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-slate-700 outline-none">
          <option>Periode: 30 Hari Terakhir</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARD ESTIMASI HONOR BULAN INI (Dinamis / Otomatis Menjadi Rp 0 Saat Habis) */}
        <div className="bg-teal-800 text-white p-5 rounded-2xl shadow flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-teal-100 font-medium">Estimasi Honor Bulan Ini</p>
            <h3 className="text-xl font-bold">
              Rp {currentHonorBalance.toLocaleString("id-ID")}
            </h3>
            <p className="text-[9px] text-teal-200">Telah dikurangi biaya administrasi platform 10%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-slate-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium">Total Sesi Konsultasi</p>
            <h3 className="text-xl font-bold text-slate-900">{report?.total_sessions || "98 Sesi Selesai"}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold">+12% peningkatan vs bulan lalu</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium">Rerata Rating Kepuasan</p>
            <h3 className="text-xl font-bold text-slate-900">{report?.satisfaction_rating || "4.92 / 5.00"}</h3>
            <p className="text-[10px] text-gray-400">Dari total 84 ulasan tertulis</p>
          </div>
        </div>
      </div>

      {/* Chart & Box Form Pencairan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800">Volume Sesi Mingguan (Konsultasi)</h3>
            <span className="text-[10px] text-gray-400">Total: 98 Sesi</span>
          </div>

          <div className="h-48 flex items-end justify-between px-6 pt-6 border-b border-gray-100">
            {[
              { label: "Minggu 1", count: "18 Sesi", height: "h-28" },
              { label: "Minggu 2", count: "24 Sesi", height: "h-36" },
              { label: "Minggu 3", count: "30 Sesi", height: "h-44" },
              { label: "Minggu 4", count: "26 Sesi", height: "h-40" },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <span className="text-[9px] text-gray-400 font-medium">{bar.count}</span>
                <div className={`w-12 bg-teal-600 rounded-t-lg ${bar.height}`} />
                <span className="text-[10px] text-gray-500 font-medium">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Form Pencairan & Riwayat Real-Time */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-800">Riwayat & Form Pencairan</h3>

          {/* List Riwayat Pencairan */}
          <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
            {payoutsList.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">Belum ada riwayat pengajuan.</p>
            ) : (
              payoutsList.map((item, i) => (
                <div key={i} className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 text-[11px]">Rp {Number(item.amount).toLocaleString("id-ID")}</p>
                    <p className="text-[9px] text-gray-400">
                      {new Date(item.created_at).toLocaleDateString("id-ID")} • 
                      <span className={item.status === 'approved' ? 'text-emerald-600 font-semibold' : item.status === 'rejected' ? 'text-rose-600 font-semibold' : 'text-amber-600 font-semibold'}>
                        {item.status === 'approved' ? ' Berhasil' : item.status === 'rejected' ? ' Ditolak' : ' Menunggu'}
                      </span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">PO-#{item.id}</span>
                </div>
              ))
            )}
          </div>

          {/* Form Pencairan Saldo */}
          <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                SISA SALDO PRAKTIK
              </span>
              <span className="font-extrabold text-slate-900 text-xs">
                Rp {currentHonorBalance.toLocaleString("id-ID")}
              </span>
            </div>

            {currentHonorBalance > 0 ? (
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">Rp</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Nominal penarikan..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  onClick={handleRequestPayout}
                  disabled={isSubmittingPayout}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5"
                >
                  {isSubmittingPayout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>Ajukan Pencairan Baru</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-amber-700 font-medium text-center py-1">
                Semua saldo honor bulan ini telah dicairkan / sedang diproses.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}