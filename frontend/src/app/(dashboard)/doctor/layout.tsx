"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Video, 
  BarChart3, 
  Settings 
} from "lucide-react";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
    { name: "Pasien Saya", href: "/doctor/patients", icon: Users },
    { name: "Jadwal", href: "/doctor/schedule", icon: Calendar },
    { name: "Konsultasi pasien", href: "/doctor/consultation", icon: Video },
    { name: "Laporan", href: "/doctor/reports", icon: BarChart3 },
    { name: "Pengaturan", href: "/doctor/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-50/50 flex font-sans">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 fixed inset-y-0 left-0 z-50">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-full bg-teal-700" />
            <span className="font-serif font-bold text-xl text-slate-900 tracking-wide">Calma</span>
          </div>

          {/* Menu Navigasi */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-stone-100 text-slate-900 font-semibold"
                      : "text-gray-500 hover:bg-stone-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profil Dokter di Footer Sidebar */}
        <div className="pt-4 border-t border-gray-100 flex items-center space-x-3">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200"
            alt="Dr. Adrian Hartanto"
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-slate-900 truncate">Dr. Adrian Hartanto</h4>
            <p className="text-[10px] text-gray-400 truncate">Spesialis Psikiatri</p>
          </div>
        </div>
      </aside>

      {/* Konten Utama di Kanan */}
      <main className="flex-1 ml-64 p-8 bg-stone-50/30 min-h-screen">
        {children}
      </main>
    </div>
  );
}