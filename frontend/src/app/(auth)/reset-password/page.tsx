"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Step 1: Input Email, Step 2: Input Password Baru
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle Langkah 1: Simpan Email dan Lanjut ke Input Password
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Silakan masukkan email terlebih dahulu.");
      return;
    }

    setStep(2);
  };

  // Handle Langkah 2: Kirim Email & Password Baru ke Backend FastAPI
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Mencegah error [object Object]
        const errorMessage = typeof data.detail === "string" 
          ? data.detail 
          : data.message || "Gagal memperbarui kata sandi.";
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      const errorText = typeof err.message === "string" 
        ? err.message 
        : "Terjadi kesalahan pada sistem.";
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50/50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-teal-800 text-center mb-2">
          {step === 1 ? "Lupa Kata Sandi" : "Atur Kata Sandi Baru"}
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          {step === 1 
            ? "Masukkan email akun Anda yang terdaftar." 
            : `Masukkan kata sandi baru untuk akun ${email}`}
        </p>

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 text-center">
            Kata sandi berhasil diperbarui! Mengalihkan ke halaman login...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* FORM LANGKAH 1: INPUT EMAIL */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Terdaftar
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow"
            >
              Lanjut
            </button>
          </form>
        )}

        {/* FORM LANGKAH 2: INPUT PASSWORD BARU */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Simpan Kata Sandi Baru"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-gray-500 hover:text-teal-600 font-medium text-center pt-1"
            >
              ← Ubah Email
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs text-teal-600 font-semibold hover:underline">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}