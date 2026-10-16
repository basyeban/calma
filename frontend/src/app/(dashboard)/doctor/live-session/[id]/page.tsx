
"use client";

import { useParams, useRouter } from "next/navigation";
import ConsultationVideoCall from "@/components/ConsultationVideoCall";

export default function DoctorLiveSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const consultationId = String(params.id ?? "");

  if (!consultationId.trim()) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-600">
          ID konsultasi tidak ditemukan.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-lg border bg-white px-4 py-2"
        >
          Kembali
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          ← Kembali
        </button>

        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            Sesi Konsultasi Dokter
          </h1>
          <p className="mt-2 text-slate-600">
            Pastikan jadwal dan identitas pasien telah
            diverifikasi sebelum memulai konsultasi.
          </p>
        </header>

        <ConsultationVideoCall
          consultationId={consultationId}
          role="doctor"
        />
      </div>
    </main>
  );
}
