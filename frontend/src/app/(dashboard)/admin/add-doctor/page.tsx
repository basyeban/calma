"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Eye, EyeOff, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AddDoctorPage() {
  const router = useRouter();

  // State Input Form
  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("Psikiatri Dewasa & Ansietas");
  const [sipNumber, setSipNumber] = useState("");
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("CalmaCare#2026");
  
  // State Foto & Preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    "https://images.unsplash.com/photo-1594824813571-2153349aed06?q=80&w=120"
  );

  // State UI
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let randomPwd = "Calma#";
    for (let i = 0; i < 6; i++) {
      randomPwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTemporaryPassword(randomPwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!fullName || !sipNumber || !email || !temporaryPassword) {
      setError("Harap isi seluruh kolom yang wajib (*)");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("specialization", specialization);
      formData.append("sip_number", sipNumber);
      formData.append("email", email);
      formData.append("temporary_password", temporaryPassword);

      if (selectedFile) {
        formData.append("profile_photo", selectedFile);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");

      const res = await fetch(`${apiUrl}/api/admin/doctors`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Gagal menyimpan data dokter.");
      }

      setSuccess("Akun dokter dan foto profil berhasil disimpan!");
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem saat mengirim data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      <div>
        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
          DIREKTORI KLINIS • Manajemen Tenaga Medis
        </span>
        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
          Tambah Akun Dokter Baru
        </h1>
        <p className="text-xs text-gray-500">
          Daftarkan psikiater dan buat kredensial login resmi mereka ke dalam sistem rekam medis Calma.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-rose-600 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center space-x-2 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-stone-50/80 rounded-2xl p-6 border border-stone-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200/60">
              <span className="text-xs font-bold text-slate-800">Data Kredensial & Praktik</span>
              <span className="text-[10px] bg-stone-200/70 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Langkah 1 dari 1
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Lengkap & Gelar Medis *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="contoh: dr. Sarah Wijaya, Sp.KJ"
                className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Spesialisasi Klinis *
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none text-slate-800 focus:ring-1 focus:ring-teal-700"
                >
                  <option value="Psikiatri Dewasa & Ansietas">Psikiatri Dewasa & Ansietas</option>
                  <option value="Psikologi Klinis & Trauma">Psikologi Klinis & Trauma</option>
                  <option value="Psikiatri Anak & Remaja">Psikiatri Anak & Remaja</option>
                  <option value="Konseling Adiksi & Bipolar">Konseling Adiksi & Bipolar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor SIP (Surat Izin Praktik) *
                </label>
                <input
                  type="text"
                  required
                  value={sipNumber}
                  onChange={(e) => setSipNumber(e.target.value)}
                  placeholder="contoh: 503/SIP-DS/DISKES/2026"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Akses (sebagai Username) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: sarah.wijaya@calma.id"
                className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Kata Sandi Sementara *</label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Buat Sandi Acak Kuat</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Unggah Foto Profil Dokter
              </label>
              <div className="flex items-center space-x-3 bg-white p-3 border border-gray-200 rounded-xl">
                <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition">
                  <Upload className="w-3.5 h-3.5 text-teal-800" />
                  <span>Pilih Foto</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-gray-400 truncate">
                  {selectedFile ? selectedFile.name : "Format: JPG, PNG, atau WEBP"}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2 text-xs border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-stone-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs bg-teal-800 text-white font-medium rounded-xl hover:bg-teal-900 shadow transition flex items-center space-x-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? "Menyimpan Data..." : "Buat Akun & Kirim Detail Login"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-sky-50/40 p-5 rounded-2xl border border-sky-100 space-y-4">
            <span className="text-xs font-bold text-slate-800 block">Pratinjau Kartu Dokter</span>
            <div className="bg-sky-100/50 p-4 rounded-xl flex items-center space-x-3 border border-sky-200/50">
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-slate-800 truncate">
                  {fullName || "dr. Nama Dokter, Sp.KJ"}
                </h4>
                <p className="text-[10px] text-gray-500 truncate">
                  {specialization}
                </p>
                <p className="text-[9px] text-teal-700 font-mono mt-0.5">
                  {sipNumber || "SIP: -"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}