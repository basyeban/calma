"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Email/Username atau password salah.");
      }

      // 1. Simpan data autentikasi ke localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("full_name", data.full_name);

      // 2. Arahkan pengguna berdasarkan role yang dikembalikan backend
      const roleUpper = data.role ? data.role.toUpperCase() : "";

      if (roleUpper === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (roleUpper === "PATIENT") {
        router.push("/patient/dashboard");
      } else if (roleUpper === "DOCTOR") {
        router.push("/doctor/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mencoba masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50/50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-800">Selamat Datang Kembali</h1>
          <p className="text-gray-500 text-sm mt-1">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email / Username
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
              placeholder="admin atau nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-teal-600 hover:underline font-medium"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/register" className="text-teal-600 font-semibold hover:underline">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}