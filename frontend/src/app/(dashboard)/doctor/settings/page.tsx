"use client";

import Link from "next/link";
import { Star } from "lucide-react";

export default function DoctorSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-800">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Profil Profesional Dokter</h1>
        <p className="text-xs text-gray-500 mt-1">
          Kelola kredensial medis, data praktik, serta ulasan konsultasi kesehatan mental Anda.
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center space-x-4">
        <img
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200"
          alt="dr. Sarah"
          className="w-16 h-16 rounded-full object-cover border-2 border-stone-100"
        />
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-serif font-bold text-slate-900">dr. Sarah Utami, Sp.KJ</h3>
            <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-semibold rounded-md">
              Terverifikasi
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Spesialis Kedokteran Jiwa (Psikiater)</p>
        </div>
      </div>

      {/* Credentials & Bio */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 text-xs">
        <h3 className="font-serif font-bold text-sm text-slate-900">Informasi Kredensial & Bio</h3>

        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Biografi Profesional</label>
          <p className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-slate-700 leading-relaxed">
            Berpengalaman dalam menangani gangguan kecemasan, depresi, serta manajemen stres perkotaan dengan pendekatan holistik. Berkomitmen menciptakan ruang aman yang bebas stigma bagi setiap konsultasi pasien.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">Nomor SIP (Surat Izin Praktik)</label>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-slate-800 font-medium">
              SIP: 440/1209/DS/2021
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">Pengalaman Praktik</label>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-slate-800 font-medium">
              12 Tahun Praktik
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 text-xs">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-sm text-slate-900">Kepuasan Pasien & Ulasan</h3>
          <div className="flex items-center space-x-1 text-amber-500 font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>4.9 / 5</span>
            <span className="text-[10px] text-gray-400 font-normal">(180+ Ulasan)</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <p className="text-slate-700 italic">"Sangat menenangkan dan memberikan solusi konkret tanpa menghakimi."</p>
            <p className="text-[10px] text-gray-400">— R. Hartono, Pasien Konsultasi Stres Kerja</p>
          </div>
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <p className="text-slate-700 italic">"Pendengar yang luar biasa. Terapi kecemasan saya sangat terbantu."</p>
            <p className="text-[10px] text-gray-400">— S. Amanda, Pasien Kecemasan Umum</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between pt-4 gap-3">
          <div className="flex space-x-3">
            <Link
              href="/doctor/schedule"
              className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-xl text-xs shadow transition"
            >
              Atur Ketersediaan Jadwal
            </Link>
            <Link
              href="/doctor/settings/edit"
              className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-xs hover:bg-stone-50 transition"
            >
              Edit Data Praktik
            </Link>
          </div>

          <button className="px-5 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium rounded-xl text-xs transition">
            Logout / Keluar Akun
          </button>
        </div>
      </div>
    </div>
  );
}