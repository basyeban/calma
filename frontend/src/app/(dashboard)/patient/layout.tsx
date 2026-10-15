"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  MessageSquare,
  History,
  Settings,
  Heart,
  LogOut,
  Menu,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState<string>("");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State untuk modal konfirmasi

  const checkAuthAndFetchProfile = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const storedName = localStorage.getItem("full_name");
      const storedAvatar = localStorage.getItem("profile_image");

      if (storedName) {
        setUserName(storedName);
      } else {
        setUserName("Pasien");
      }

      if (storedAvatar) {
        setUserImage(storedAvatar);
      }
    } catch (err) {
      console.error("Error checking auth:", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetchProfile();

    const handleProfileUpdate = () => checkAuthAndFetchProfile();
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const getInitials = (name: string) => {
    if (!name) return "P";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Area Pasien", href: "/patient/area", icon: UserCheck },
    { name: "Konsultasi", href: "/patient/consultation", icon: MessageSquare },
    { name: "Riwayat", href: "/patient/history", icon: History },
    { name: "Pengaturan", href: "/patient/settings", icon: Settings },
  ];

  // Fungsi Logout yang membersihkan sesi dan mencegah tombol back browser
  const handleConfirmLogout = () => {
    // 1. Hapus semua data sesi di localStorage
    localStorage.clear();

    // 2. Timpa history browser agar tombol back tidak bisa kembali ke dashboard
    window.location.replace("/login");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800">
      {/* TopBar Mobile */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xl">
          <Heart className="fill-teal-600 text-teal-600 w-6 h-6" />
          <span>Calma</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigasi */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out flex-shrink-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="hidden md:flex items-center gap-2 mb-10 text-teal-700 font-bold text-2xl">
            <Heart className="fill-teal-600 text-teal-600 w-7 h-7" />
            <span>Calma</span>
          </div>

          <nav className="space-y-1 mt-4 md:mt-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-teal-600" : "text-slate-400"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profil Pasien Dinamis */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden border border-teal-200">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                ) : userImage ? (
                  <img src={userImage} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  getInitials(userName)
                )}
              </div>
              <div className="truncate">
                {loading ? (
                  <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                    {userName || "Pasien"}
                  </p>
                )}
                <p className="text-xs text-slate-400">Pasien Aktif</p>
              </div>
            </div>

            {/* Tombol Logout memicu Modal */}
            <button
              onClick={() => setShowLogoutModal(true)}
              title="Keluar / Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-full">
        {children}
      </main>

      {/* MODAL KONFIRMASI LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Keluar dari Akun?</h3>
              <p className="text-xs text-slate-500">
                Anda harus masuk kembali menggunakan kredensial Anda untuk mengakses portal Calma.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}