"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, CheckCircle, Calendar, RefreshCw, Video, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const doctorId = localStorage.getItem("doctor_id") || "6"; // ID Dokter Aktif

      // 1. Ambil data konsultasi dari Supabase berdasarkan dokter yang login
      const { data: consultations, error } = await supabase
        .from("consultations")
        .select(`
          id,
          consultation_date,
          time_slot,
          status,
          patient_profiles (
            id,
            gender,
            users (
              id,
              full_name,
              email
            )
          )
        `)
        .eq("doctor_id", doctorId);

      if (!error && consultations && consultations.length > 0) {
        const queueList = consultations.map((item: any, index: number) => {
          const patientUser = item.patient_profiles?.users;
          return {
            id: item.id || `CLM-00${index + 1}`,
            name: patientUser?.full_name || "Pasien",
            time: item.time_slot || "10:00 - 11:00",
            type: "Video Call",
            status: item.status === "completed" ? "Selesai" : "Sedang Berlangsung",
            ageGender: `${item.patient_profiles?.gender || "Laki-laki"}`,
            diagnosis: "F41.1 Gangguan Kecemasan Menyeluruh",
            note: "Pasien merespon baik teknik pernapasan diaphragmatic.",
            anxietyScore: "12 (Sedang)",
          };
        });

        const dashboardResult = {
          doctor_name: "Dr. Danuar Ilham, Sp.KJ",
          stats: {
            total_patients_today: queueList.length,
            completed_sessions: queueList.filter((q: any) => q.status === "Selesai").length,
            tomorrow_sessions: 1,
            waiting_patients: 0,
            ongoing_patients: queueList.filter((q: any) => q.status === "Sedang Berlangsung").length,
            completion_rate: 100,
          },
          queue: queueList,
        };

        setData(dashboardResult);
        setSelectedPatient({
          id: queueList[0].id,
          name: queueList[0].name,
          ageGender: queueList[0].ageGender,
          photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150",
          diagnosis: queueList[0].diagnosis,
          note: queueList[0].note,
          anxietyScore: queueList[0].anxietyScore,
        });
        setLoading(false);
        return;
      }

      // 2. Fallback Data Tunggal (Hanya 1 Pasien: Achmad Daniel) jika database belum terhubung
      const singlePatientFallback = {
        doctor_name: "Dr. Danuar Ilham, Sp.KJ",
        stats: {
          total_patients_today: 1,
          completed_sessions: 0,
          tomorrow_sessions: 1,
          waiting_patients: 0,
          ongoing_patients: 1,
          completion_rate: 0,
        },
        queue: [
          { 
            id: "CLM-4029-SAR", 
            name: "Achmad Daniel", 
            time: "10:00 - 11:00 WIB", 
            type: "Video Call", 
            status: "Sedang Berlangsung", 
            ageGender: "19 Tahun / Laki-laki", 
            diagnosis: "F41.1 Gangguan Kecemasan Menyeluruh", 
            note: "Pasien merespon baik teknik pernapasan diaphragmatic 4-7-8.", 
            anxietyScore: "12 (Sedang)" 
          },
        ],
      };

      setData(singlePatientFallback);
      setSelectedPatient({
        id: singlePatientFallback.queue[0].id,
        name: singlePatientFallback.queue[0].name,
        ageGender: singlePatientFallback.queue[0].ageGender,
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
        diagnosis: singlePatientFallback.queue[0].diagnosis,
        note: singlePatientFallback.queue[0].note,
        anxietyScore: singlePatientFallback.queue[0].anxietyScore,
      });

    } catch (err) {
      console.error("Gagal memuat dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-teal-800 mb-2" />
        <span className="text-xs">Memuat Dashboard Klinis...</span>
      </div>
    );
  }

  const { doctor_name, stats, queue } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-slate-800 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Selamat Pagi, {doctor_name || "Dokter"}
          </h1>
          <p className="text-xs text-gray-500">
            Berikut adalah ringkasan sesi dan antrean pasien Anda.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-slate-600 shadow-sm">
          {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-slate-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Total Pasien Hari Ini</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.total_patients_today} Pasien</h3>
            <p className="text-[10px] text-gray-400">
              {stats.waiting_patients || 0} Menunggu, {stats.ongoing_patients || 0} Berlangsung
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Sesi Selesai</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.completed_sessions} Sesi</h3>
            <p className="text-[10px] text-gray-400">
              {stats.completion_rate || 0}% dari jadwal hari ini
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Konsultasi Besok</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.tomorrow_sessions} Sesi</h3>
            <p className="text-[10px] text-gray-400">Semua sesi via Video Call</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Antrean & Detail Pasien */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Antrean Pasien (Hanya 1 Pasien) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Antrean Pasien Aktif</h3>
              <p className="text-[11px] text-gray-400">Daftar pasien yang terhubung ke jadwal Anda</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-xl text-gray-600 hover:bg-stone-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perbarui</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase">
                  <th className="py-2.5">No</th>
                  <th className="py-2.5">Nama Pasien</th>
                  <th className="py-2.5">Waktu</th>
                  <th className="py-2.5">Jenis Sesi</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {queue && queue.map((row: any, index: number) => {
                  const isActive = row.status === "Sedang Berlangsung";
                  return (
                    <tr
                      key={row.id || index}
                      onClick={() =>
                        setSelectedPatient({
                          id: row.id,
                          name: row.name,
                          ageGender: row.ageGender,
                          photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
                          diagnosis: row.diagnosis,
                          note: row.note,
                          anxietyScore: row.anxietyScore,
                        })
                      }
                      className={`cursor-pointer transition ${
                        isActive ? "bg-stone-100/70 font-semibold" : "hover:bg-stone-50"
                      }`}
                    >
                      <td className="py-3 px-2">{index + 1}</td>
                      <td className="py-3 font-bold text-slate-800">{row.name}</td>
                      <td className="py-3 text-gray-500">{row.time}</td>
                      <td className="py-3 text-gray-600">{row.type}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                            row.status === "Selesai"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-stone-200/80 text-stone-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Detail Pasien & Tombol Video Call */}
        {selectedPatient && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5 text-center">
            <img
              src={selectedPatient.photo}
              alt={selectedPatient.name}
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-stone-100 shadow-sm"
            />
            <div>
              <h3 className="font-bold text-sm text-slate-900">{selectedPatient.name}</h3>
              <p className="text-[11px] text-gray-400">{selectedPatient.ageGender}</p>
            </div>

            <hr className="border-gray-100" />

            <div className="text-left space-y-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">DIAGNOSIS UTAMA</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedPatient.diagnosis}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">CATATAN MEDIS</span>
                <p className="text-[11px] text-gray-600 mt-0.5 italic leading-relaxed">
                  {selectedPatient.note}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/doctor/consultation/${selectedPatient.id}`)}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white font-medium py-2.5 rounded-xl text-xs shadow flex items-center justify-center space-x-2 transition"
            >
              <Video className="w-4 h-4" />
              <span>Mulai Video Konsultasi</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}