"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditDoctorPracticePage() {
  const router = useRouter();

  const [videoFee, setVideoFee] = useState("250000");
  const [chatFee, setChatFee] = useState("120000");
  const [bio, setBio] = useState(
    "Berpengalaman dalam menangani gangguan kecemasan, depresi, serta manajemen stres perkotaan dengan pendekatan holistik. Berkomitmen menciptakan ruang aman yang bebas stigma bagi setiap konsultasi pasien."
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-800 pb-12">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Edit Data Praktik</h1>
        <p className="text-xs text-gray-500 mt-1">
          Sesuaikan ketersediaan jadwal, tarif sesi konsultasi, dan informasi klinis profil profesional Anda.
        </p>
      </div>

      {/* Layanan & Tarif Konsultasi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 text-xs">
        <div>
          <h3 className="font-serif font-bold text-sm text-slate-900">Layanan & Tarif Konsultasi</h3>
          <p className="text-[10px] text-gray-400">Aktifkan mode layanan praktik dan tetapkan harga yang sesuai untuk setiap sesi konsultasi.</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
            <div>
              <p className="font-bold text-slate-800">Konsultasi Video</p>
              <p className="text-[10px] text-gray-400">Sesi tatap muka online</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Rp</span>
              <input
                type="text"
                value={videoFee}
                onChange={(e) => setVideoFee(e.target.value)}
                className="w-32 px-3 py-1.5 border rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-teal-700"
              />
              <span className="text-[10px] text-gray-400">per sesi (50 menit)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
            <div>
              <p className="font-bold text-slate-800">Konsultasi Chat</p>
              <p className="text-[10px] text-gray-400">Sesi tanya jawab teks real-time</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Rp</span>
              <input
                type="text"
                value={chatFee}
                onChange={(e) => setChatFee(e.target.value)}
                className="w-32 px-3 py-1.5 border rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-teal-700"
              />
              <span className="text-[10px] text-gray-400">per sesi (30 menit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Klinis & Spesialisasi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 text-xs">
        <div>
          <h3 className="font-serif font-bold text-sm text-slate-900">Informasi Klinis & Spesialisasi</h3>
          <p className="text-[10px] text-gray-400">Tulis biografi singkat serta pilih topik spesialisasi mental yang sesuai dengan keahlian praktik medis Anda.</p>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">Biografi Profesional</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 bg-stone-50 border border-gray-200 rounded-xl outline-none text-xs focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-2">Fokus & Spesialisasi Dokter</label>
          <div className="flex flex-wrap gap-2">
            {["Kecemasan ✕", "Depresi ✕", "Stres Kerja ✕", "+ Gangguan Tidur", "+ Bipolar", "+ Trauma / PTSD", "+ Adiksi"].map((tag, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-[10px] font-medium cursor-pointer ${
                  tag.includes("✕") ? "bg-stone-200 text-slate-800" : "bg-stone-50 border border-gray-200 text-gray-500 hover:bg-stone-100"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 text-xs border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-stone-50 transition"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => {
            alert("Perubahan data praktik berhasil disimpan!");
            router.push("/doctor/settings");
          }}
          className="px-6 py-2.5 text-xs bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-xl shadow transition"
        >
          Simpan Perubahan Praktik
        </button>
      </div>
    </div>
  );
}