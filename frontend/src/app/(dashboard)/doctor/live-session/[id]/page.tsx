"use client";

import { useRouter } from "next/navigation";
import { PhoneCall } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DoctorQueuePage() {
  const router = useRouter();

  const handleCallPatient = async (consultationId: number) => {
    try {
      console.log(`[DOKTER] Mengirim Panggilan Realtime untuk Sesi #${consultationId}`);

      // 1. Update Database Status Menjadi 'calling'
      await supabase
        .from("consultations")
        .update({ status: "calling" })
        .eq("id", consultationId);

      // 2. Pancarkan Broadcast ke Room Sesi Khusus
      const roomId = `ROOM-CLM-${consultationId}`;
      const channel = supabase.channel(`consultation_${roomId}`);

      // 3. Pancarkan Broadcast ke Channel Global Fallback
      const globalChannel = supabase.channel("global_consultation_calls");

      await channel.subscribe();
      await globalChannel.subscribe();

      // Kirim Sinyal
      channel.send({
        type: "broadcast",
        event: "doctor-calling",
        payload: { consultationId },
      });

      globalChannel.send({
        type: "broadcast",
        event: "doctor-calling",
        payload: { consultationId },
      });

      // 4. Buka Halaman Ruang Live Dokter
      router.push(`/doctor/consultation/${consultationId}`);

    } catch (err) {
      console.error("Gagal memanggil pasien:", err);
      // Fallback tetap buka halaman live
      router.push(`/doctor/consultation/${consultationId}`);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Daftar Antrean Pasien</h1>
      
      <div className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="font-bold text-slate-900 text-sm">Achmad Daniel</h2>
          <p className="text-xs text-slate-500">Sesi ID: #4029 • Jadwal: 14:00 WIB</p>
        </div>

        <button
          onClick={() => handleCallPatient(4029)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 animate-pulse"
        >
          <PhoneCall className="w-4 h-4" /> Panggil Pasien Sesi Ini
        </button>
      </div>
    </div>
  );
}