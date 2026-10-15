"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  History,
  Sliders,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manajemen Pengguna", href: "/admin/users", icon: Users },
    { name: "Tambah Dokter", href: "/admin/add-doctor", icon: UserPlus },
    { name: "Laporan Keuangan", href: "/admin/financials", icon: History },
    { name: "Pengaturan Sistem", href: "/admin/settings", icon: Sliders },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50/60 font-sans text-gray-800">
      {/* Sidebar Left */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 shrink-0 fixed top-0 bottom-0 left-0 z-20">
        <div>
          <div className="flex items-center space-x-2.5 mb-8">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span className="font-serif font-bold text-xl text-slate-900 tracking-tight">
              Calma
            </span>
          </div>

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
                      : "text-gray-500 hover:bg-stone-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100"
            alt="Budi Santoso"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="text-xs">
            <h4 className="font-bold text-slate-800 leading-none">Budi Santoso</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Super Admin</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}