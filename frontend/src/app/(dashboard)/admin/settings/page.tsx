"use client";

import { useState, useEffect } from "react";
import { DollarSign, Power, Key, Shield, Copy, Check, Loader2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [commission, setCommission] = useState<number>(20);
  const [minFee, setMinFee] = useState<number>(100000);
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [stripeKey, setStripeKey] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("-");

  // Fetch data saat halaman dimuat
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Gagal mengambil pengaturan.");
      const data = await res.json();

      setCommission(data.platform_commission_pct);
      setMinFee(data.min_consultation_fee);
      setIsMaintenance(data.is_maintenance_mode);
      setStripeKey(data.stripe_secret_key);

      if (data.updated_at) {
        const dateObj = new Date(data.updated_at);
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        setLastUpdated(`Terakhir diubah oleh ${data.updated_by || "Admin"} pada ${formattedDate} WIB.`);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Terjadi kesalahan saat memuat data." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform_commission_pct: Number(commission),
          min_consultation_fee: Number(minFee),
          is_maintenance_mode: isMaintenance,
          stripe_secret_key: stripeKey,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan pengaturan.");
      const data = await res.json();
      setMessage({ type: "success", text: "Pengaturan berhasil diperbarui!" });
      
      if (data.updated_at) {
        const dateObj = new Date(data.updated_at);
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        setLastUpdated(`Terakhir diubah oleh ${data.updated_by || "Admin"} pada ${formattedDate} WIB.`);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menyimpan perubahan." });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(stripeKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-7 h-7 animate-spin text-teal-800 mb-2" />
        <span className="text-xs">Memuat Pengaturan Sistem...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-800 pb-12">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          Pengaturan Sistem & Keamanan
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Konfigurasi komisi bagi hasil platform Calma, kelola mode pemeliharaan, serta atur preferensi sistem utama.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Konfigurasi Finansial & Bagi Hasil */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-6 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-700 font-medium text-sm">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-semibold">Konfigurasi Finansial & Bagi Hasil</span>
        </div>

        <hr className="border-gray-100" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Bagi Hasil Komisi Platform (%)
            </label>
            <p className="text-[11px] text-gray-400 mb-2">
              Persentase pendapatan kotor dari konsultasi yang disimpan oleh platform Calma.
            </p>
            <div className="relative flex items-center">
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-teal-700 font-medium"
              />
              <span className="absolute right-4 text-xs text-gray-400">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Tarif Minimum Konsultasi (IDR)
            </label>
            <p className="text-[11px] text-gray-400 mb-2">
              Batas biaya konsultasi per sesi terendah yang dapat dipasang oleh mitra medis terdaftar.
            </p>
            <div className="relative flex items-center">
              <input
                type="text"
                value={minFee.toLocaleString("id-ID")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setMinFee(Number(val));
                }}
                className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-teal-700 font-medium"
              />
              <span className="absolute right-4 text-xs text-gray-400">Rupiah</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mode Pemeliharaan (Maintenance Mode) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-6 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-700 font-medium text-sm">
          <Power className="w-4 h-4 text-gray-400" />
          <span className="font-semibold">Mode Pemeliharaan (Maintenance Mode)</span>
        </div>

        <hr className="border-gray-100" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-800">
                Aktifkan Mode Pemeliharaan Sistem
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Bila diaktifkan, pasien tidak akan dapat menjadwalkan konsultasi video call atau chat baru untuk sementara waktu. Dokter masih dapat mengakses rekam medis pasien mereka.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setIsMaintenance(!isMaintenance)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isMaintenance ? "bg-amber-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isMaintenance ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-center space-x-2.5 text-xs ${
              isMaintenance
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-emerald-50/60 border-emerald-100 text-emerald-800"
            }`}
          >
            <Shield className="w-4 h-4 shrink-0 text-gray-400" />
            <span>
              {isMaintenance
                ? "Sistem sedang dalam mode pemeliharaan. Konsultasi baru dinonaktifkan."
                : "Sistem platform Calma saat ini beroperasi penuh dan normal. Tidak ada gangguan layanan yang dilaporkan."}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Kredensial API Payment Gateway */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-6 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-700 font-medium text-sm">
          <Key className="w-4 h-4 text-gray-400" />
          <span className="font-semibold">Kredensial API Payment Gateway (Stripe)</span>
        </div>

        <hr className="border-gray-100" />

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">
            Live Secret Key (Stripe Production)
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-700 outline-none focus:bg-white focus:border-teal-700 pr-20"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className="absolute right-2 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-600 rounded-lg text-[11px] font-medium transition flex items-center space-x-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Tersalin" : "Salin"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
        <span className="text-[11px] text-gray-400">
          {lastUpdated}
        </span>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={saving}
            className="px-5 py-2 text-xs border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-stone-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-xs bg-teal-800 text-white font-medium rounded-xl hover:bg-teal-900 shadow transition flex items-center space-x-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}