"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Brain, 
  HeartHandshake, 
  Activity, 
  Smile, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  FileText,
  BookOpen,
  Wind,
  X,
  Play,
  RotateCcw,
  Loader2,
  UserCheck
} from "lucide-react";
import { firebaseService } from "@/lib/firebase";

export default function PatientDashboard() {
  const [screening, setScreening] = useState<any>(null);
  const [fullName, setFullName] = useState<string>("");
  const [loadingName, setLoadingName] = useState<boolean>(true);

  // State untuk Sesi Mendatang Dinamis dari Firebase Realtime Database
  const [upcomingSession, setUpcomingSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  // State untuk Modal Edukasi Mental & Latihan Pernapasan
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);

  // State untuk timer Latihan Pernapasan 4-7-8
  const [breathPhase, setBreathPhase] = useState<"Siap" | "Hirup (Inhale)" | "Tahan (Hold)" | "Hembuskan (Exhale)">("Siap");
  const [breathCountdown, setBreathCountdown] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoadingName(true);
        setLoadingSession(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const token = localStorage.getItem("patient_token") || localStorage.getItem("token");

        if (!token) {
          setFullName("Pasien");
          setLoadingName(false);
          setLoadingSession(false);
          return;
        }

        // 1. Fetch Profile Pasien
        const profileRes = await fetch(`${apiUrl}/api/patient/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setFullName(profileData.full_name || "Pasien");
        } else {
          setFullName("Pasien");
        }

        // 2. Fetch Latest Screening Data
        const screeningRes = await fetch(`${apiUrl}/api/screenings/latest`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (screeningRes.ok) {
          const resData = await screeningRes.json();
          setScreening(resData.data);
        }

        // 3. Fetch Sesi Mendatang Dinamis dari Firebase Realtime Database
        const sessionData = await firebaseService.getUpcomingPatientSession();
        setUpcomingSession(sessionData);

      } catch (err) {
        console.error("Gagal memuat data profil atau sesi pasien:", err);
        setFullName("Pasien");
      } finally {
        setLoadingName(false);
        setLoadingSession(false);
      }
    };

    fetchPatientData();
  }, []);

  // Logika Animasi Latihan Pernapasan 4-7-8
  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      if (breathPhase === "Siap") {
        setBreathPhase("Hirup (Inhale)");
        setBreathCountdown(4);
      } else if (breathPhase === "Hirup (Inhale)") {
        interval = setInterval(() => {
          setBreathCountdown((prev) => {
            if (prev <= 1) {
              setBreathPhase("Tahan (Hold)");
              return 7;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (breathPhase === "Tahan (Hold)") {
        interval = setInterval(() => {
          setBreathCountdown((prev) => {
            if (prev <= 1) {
              setBreathPhase("Hembuskan (Exhale)");
              return 8;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (breathPhase === "Hembuskan (Exhale)") {
        interval = setInterval(() => {
          setBreathCountdown((prev) => {
            if (prev <= 1) {
              setBreathPhase("Hirup (Inhale)");
              return 4;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  const stopBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase("Siap");
    setBreathCountdown(4);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ================= MODAL: EDUKASI MENTAL & JURNAL ================= */}
        {showEducationModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
              <button 
                onClick={() => setShowEducationModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Pusat Edukasi & Jurnal Mental</h2>
                    <p className="text-xs text-slate-500">Panduan kesehatan emosional dan artikel pemulihan diri.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100/60 space-y-2 hover:border-teal-300 transition-all cursor-pointer">
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-100/80 px-2.5 py-0.5 rounded-full">Artikel Populer</span>
                    <h3 className="font-bold text-slate-900 text-sm">Mengatasi Kecemasan Sosial di Lingkungan Kerja & Kampus</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Pelajari bagaimana mengenali pemicu kecemasan interaksi sosial dan langkah praktis untuk mengelolanya secara mandiri.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 hover:border-slate-300 transition-all cursor-pointer">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-100/80 px-2.5 py-0.5 rounded-full">Manajemen Tidur</span>
                    <h3 className="font-bold text-slate-900 text-sm">Pentingnya Sleep Hygiene untuk Kesehatan Mental</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Kualitas tidur berdampak langsung pada kestabilan emosi. Ketahui rutinitas malam hari yang menenangkan pikiran sebelum tidur.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 hover:border-slate-300 transition-all cursor-pointer">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100/80 px-2.5 py-0.5 rounded-full">Mindfulness</span>
                    <h3 className="font-bold text-slate-900 text-sm">Teknik Grounding 5-4-3-2-1 Saat Mengalami Panic Attack</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Panduan cepat menggunakan panca indra untuk kembali sadar dan tenang di saat stres melanda secara tiba-tiba.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowEducationModal(false)}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-semibold transition-all shadow"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: LATIHAN PERNAPASAN 4-7-8 ================= */}
        {showBreathingModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative text-center space-y-6">
              <button 
                onClick={() => { stopBreathing(); setShowBreathingModal(false); }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-medium border border-teal-500/30">
                  <Wind className="w-3.5 h-3.5" /> Teknik Relaksasi 4-7-8
                </div>
                <h2 className="text-xl font-bold">Latihan Pernapasan Terpandu</h2>
                <p className="text-xs text-slate-400">Tenangkan sistem saraf Anda melalui ritme pernapasan yang teratur.</p>
              </div>

              {/* Lingkaran Animasi Pernapasan */}
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full bg-teal-500/20 blur-xl transition-all duration-1000 ${
                  breathPhase === "Hirup (Inhale)" ? "scale-125 opacity-100" :
                  breathPhase === "Tahan (Hold)" ? "scale-110 opacity-80" :
                  breathPhase === "Hembuskan (Exhale)" ? "scale-75 opacity-40" : "scale-100 opacity-50"
                }`} />
                <div className="relative z-10 w-36 h-36 rounded-full border-4 border-teal-500 flex flex-col items-center justify-center bg-slate-800 shadow-inner">
                  <span className="text-3xl font-extrabold text-teal-300">{isBreathingActive ? breathCountdown : "4-7-8"}</span>
                  <span className="text-[11px] font-semibold text-slate-300 mt-1 uppercase tracking-wider">
                    {breathPhase}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 px-4 leading-relaxed">
                {breathPhase === "Siap" && "Tekan tombol Mulai di bawah untuk memulai sesi pernapasan."}
                {breathPhase === "Hirup (Inhale)" && "Hirup perlahan melalui hidung selama 4 detik..."}
                {breathPhase === "Tahan (Hold)" && "Tahan napas Anda dengan rileks selama 7 detik..."}
                {breathPhase === "Hembuskan (Exhale)" && "Hembuskan napas perlahan melalui mulut selama 8 detik..."}
              </p>

              <div className="flex gap-3 pt-2">
                {!isBreathingActive ? (
                  <button
                    onClick={() => setIsBreathingActive(true)}
                    className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" /> Mulai Latihan
                  </button>
                ) : (
                  <button
                    onClick={stopBreathing}
                    className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Berhenti / Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= HERO / BANNER MENYAPA ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10">
          <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-10 w-48 h-48 rounded-full bg-teal-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-100 text-xs font-medium border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>Ruang Kesehatan Emosional Anda</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
                Selamat Datang, {loadingName ? (
                  <span className="h-8 w-40 bg-white/20 animate-pulse rounded-xl inline-block" />
                ) : (
                  <span>{fullName}</span>
                )} 👋
              </h1>
              
              <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
                Setiap langkah kecil menuju ketenangan berharga. Mari pantau perkembangan kesehatan emosional Anda hari ini.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <Link
                href="/patient/screening"
                className="px-5 py-3 rounded-2xl bg-white text-teal-800 hover:bg-teal-50 font-semibold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
              >
                <Brain className="w-4 h-4 text-teal-600" />
                <span>Mulai Skrining</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-600 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================= STATISTIK UTAMA / WIDGET RINGKAS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Mood</span>
              <div className="p-2 rounded-2xl bg-teal-50 text-teal-600">
                <Smile className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-800">Stabil / Positif</p>
            <p className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Membaik dari minggu lalu
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skrining Terakhir</span>
              <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-800">
              {screening ? `${screening.score} / 15` : "Belum Ada"}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {screening ? `Kategori: ${screening.category}` : "Lakukan evaluasi rutin"}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sesi Mendatang</span>
              <div className="p-2 rounded-2xl bg-amber-50 text-amber-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-800">
              {upcomingSession ? "1 Sesi Sched" : "Tidak Ada Sesi"}
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              {upcomingSession ? upcomingSession.time : "Jadwalkan Konsultasi"}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proteksi Medis</span>
              <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-800">Privasi Terjaga</p>
            <p className="text-[11px] text-slate-400 mt-1">Enkripsi data end-to-end</p>
          </div>
        </div>

        {/* ================= GRID KONTEN UTAMA ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* KOLOM KIRI (8 Kolom) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Kartu Hasil Skrining Terakhir */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Evaluasi Skrining Terakhir</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Ringkasan kondisi psikologis berdasarkan kuesioner mandiri.</p>
                </div>
                <Link 
                  href="/patient/screening" 
                  className="text-xs text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1 transition-colors"
                >
                  Lihat Riwayat <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {screening ? (
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200/50">
                      Kategori: {screening.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Diperbarui baru-baru ini
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-teal-900 tracking-tight">{screening.score}</span>
                    <span className="text-sm font-medium text-slate-400">/ 15 Total Skor</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {screening.summary}
                  </p>

                  <div className="pt-2 flex gap-3">
                    <Link
                      href="/patient/screening"
                      className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                    >
                      Skrining Ulang
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-teal-50/40 rounded-2xl p-6 sm:p-8 text-center border border-dashed border-teal-200/80 space-y-3">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Belum Ada Data Skrining</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Anda belum melakukan skrining mandiri. Lakukan evaluasi awal untuk mengetahui perkembangan kondisi emosional Anda.
                    </p>
                  </div>
                  <Link 
                    href="/patient/screening" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-teal-700/10 mt-2"
                  >
                    Mulai Skrining Sekarang <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions & Program Rekomendasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-gradient-to-br from-teal-900 to-teal-800 text-white p-6 rounded-3xl shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <HeartHandshake className="w-5 h-5 text-teal-300" />
                  </div>
                  <h3 className="font-bold text-base">Konsultasi Profesional</h3>
                  <p className="text-xs text-teal-100/80 leading-relaxed">
                    Jadwalkan sesi tatap muka atau konsultasi online bersama psikiater & psikolog berpengalaman.
                  </p>
                </div>
                <Link
                  href="/patient/consultation"
                  className="w-full text-center py-3 bg-white text-teal-900 font-semibold text-xs rounded-xl hover:bg-teal-50 transition-colors shadow-sm"
                >
                  Cari Dokter & Konsultasi
                </Link>
              </div>

              {/* Kartu Buka Edukasi Mental */}
              <div 
                onClick={() => setShowEducationModal(true)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 cursor-pointer hover:border-teal-300 transition-all group"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-800">Jurnal & Panduan Diri</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Akses materi relaksasi, panduan pernapasan mandiri, serta artikel edukasi kesehatan jiwa.
                  </p>
                </div>
                <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Buka Edukasi Mental <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN (4 Kolom) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Sesi Terjadwal Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Sesi Mendatang</h2>
                <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[11px] font-bold rounded-lg">
                  {upcomingSession ? "1 Aktif" : "0 Aktif"}
                </span>
              </div>

              {loadingSession ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400 space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-teal-600" />
                  <p>Memuat jadwal konsultasi...</p>
                </div>
              ) : upcomingSession ? (
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-md shrink-0">
                      {upcomingSession.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-slate-800 truncate">{upcomingSession.doctorName}</h3>
                      <p className="text-[11px] text-slate-500 truncate">{upcomingSession.doctorTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-teal-800 font-medium border-t border-teal-100/60">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-teal-600" /> {upcomingSession.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-600" /> {upcomingSession.time}</span>
                  </div>

                  <Link
                    href="/patient/consultation"
                    className="block w-full text-center py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    Masuk Sesi Virtual
                  </Link>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 text-center space-y-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-700">Belum Ada Sesi Terjadwal</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pilih dokter dan tentukan jam konsultasi Anda.</p>
                  </div>
                  <Link
                    href="/patient/consultation"
                    className="inline-block px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    Booking Dokter Sekarang
                  </Link>
                </div>
              )}
            </div>

            {/* Kartu Tips Hari Ini / Latihan Pernapasan */}
            <div 
              onClick={() => setShowBreathingModal(true)}
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-sm space-y-4 cursor-pointer hover:ring-2 hover:ring-teal-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="w-4 h-4" /> Tips Hari Ini
                </div>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full font-semibold group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  Mulai Latihan →
                </span>
              </div>
              <h3 className="font-bold text-sm leading-snug">Latihan Pernapasan 4-7-8</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hirup napas selama 4 detik, tahan selama 7 detik, lalu hembuskan perlahan selama 8 detik untuk menenangkan sistem saraf Anda.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}