"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    gender: "Laki-laki",
    phone_number: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gunakan 127.0.0.1 secara eksplisit untuk menghindari resolusi IPv6 (localhost -> ::1)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle error validasi Pydantic dari FastAPI (array of objects)
        if (Array.isArray(data.detail)) {
          const messages = data.detail
            .map((err: any) => `${err.loc[err.loc.length - 1]}: ${err.msg}`)
            .join(" | ");
          throw new Error(messages);
        }
        // Handle error jika detail berupa object
        if (typeof data.detail === "object" && data.detail !== null) {
          throw new Error(JSON.stringify(data.detail));
        }
        // Handle error jika detail berupa string biasa
        throw new Error(data.detail || "Registrasi gagal");
      }

      alert("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch (err: any) {
      console.error("Register Error:", err);
      if (err.name === "TypeError" && err.message?.includes("fetch")) {
        setError("Gagal terhubung ke backend FastAPI. Pastikan server Uvicorn berjalan di port 8000.");
      } else {
        setError(err.message || "Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50/50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl border border-gray-100">
        <h1 className="text-3xl font-bold text-teal-800 text-center mb-2">Buat Akun Baru</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Silakan lengkapi data diri Anda untuk menggunakan <span className="font-semibold text-teal-600">Calma</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
              placeholder="Masukkan nama lengkap Anda"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          {/* Grid 2 Kolom: Tanggal Lahir & Jenis Kelamin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              />
            </div>

            {/* Radio Button Jenis Kelamin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
              <div className="flex items-center gap-6 h-10">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-900">
                  <input
                    type="radio"
                    name="gender"
                    value="Laki-laki"
                    checked={form.gender === "Laki-laki"}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  Laki-laki
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-900">
                  <input
                    type="radio"
                    name="gender"
                    value="Perempuan"
                    checked={form.gender === "Perempuan"}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  Perempuan
                </label>
              </div>
            </div>
          </div>

          {/* Grid 2 Kolom: Nomor Telepon & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
                placeholder="081234567890"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* Kata Sandi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow mt-2 disabled:opacity-50"
          >
            {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-teal-600 font-semibold hover:underline">
            Masuk ke Akun Anda
          </Link>
        </p>
      </div>
    </div>
  );
}