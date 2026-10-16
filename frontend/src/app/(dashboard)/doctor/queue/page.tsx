"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Video, Calendar, Clock, Sparkles } from "lucide-react";
import { ref, get } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export default function DoctorQueuePage() {
  const router = useRouter();
  const [patientsQueue, setPatientsQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    async function fetchQueue() {
      try {
        setLoading(true);
        const snapshot = await get(ref(rtdb, "consultations"));
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list = Object.keys(val).map((k) => ({
            id: isNaN(Number(k)) ? k : Number(k),
            ...val[k],
          }));
          
          // Filter hanya yang belum selesai
          setPatientsQueue(list.filter((item) => item.status !== "completed"));
        } else {
          // Kosongkan antrean jika database benar-benar belum ada data
          // agar tidak memaksa menampilkan nama "Achmad Daniel"
          setPatientsQueue([]);
        }
      } catch (err) {
        console.error("Gagal mengambil antrean pasien:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchQueue();
  }, []);

  const handleStartConsultation = (consultationId: number | string) => {
    router.push(`/doctor/live-session/${consultationId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8 font-sans text-slate-800 bg-slate-50/50 min-h-screen">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Portal Dokter Spesialis
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Antrean Konsultasi Pasien</h1>
          <p className="text-xs text-slate-500 mt-0.5">Pilih pasien dari daftar di bawah untuk memulai panggilan video dan konsultasi.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-700" /> Pasien Menunggu Sesi ({patientsQueue.length})
        </h2>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Memuat daftar antrean...</div>
        ) : patientsQueue.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">Belum ada antrean pasien saat ini.</div>
        ) : (
          <div className="space-y-4">
            {patientsQueue.map((patient) => (
              <div key={patient.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-teal-200 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{patient.patient_name || "Pasien Calma"}</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">ID: #{patient.id}</span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {patient.consultation_date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {patient.consultation_time} WIB</span>
                  </p>
                  {patient.chief_complaint && (
                    <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200/60 mt-2">
                      "{patient.chief_complaint}"
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleStartConsultation(patient.id)}
                  className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-bold transition shadow-md flex items-center gap-2 shrink-0"
                >
                  <Video className="w-4 h-4" /> Pilih & Panggil Pasien
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}