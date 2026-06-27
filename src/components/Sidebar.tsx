"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ArrowLeftRight,
  Eye,
  BarChart3,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/portfolios", label: "المحافظ", icon: Briefcase },
  { href: "/stocks", label: "الأسهم", icon: TrendingUp },
  { href: "/transactions", label: "المعاملات", icon: ArrowLeftRight },
  { href: "/watchlist", label: "قائمة المراقبة", icon: Eye },
  { href: "/analytics", label: "التحليلات", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 right-4 z-50 rounded-lg bg-emerald-700 p-2 text-white lg:hidden"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-emerald-900 text-white transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-emerald-800 p-5">
          <div>
            <h1 className="text-lg font-bold">متتبع الاستثمارات</h1>
            <p className="text-xs text-emerald-300">السوق السعودي - تداول</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-200 hover:bg-emerald-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-emerald-800 p-4">
          <div className="rounded-xl bg-emerald-800/50 p-4">
            <p className="text-xs text-emerald-300">السوق</p>
            <p className="mt-1 font-semibold">تداول - TASI</p>
            <p className="text-xs text-emerald-400">العملة: ريال سعودي</p>
          </div>
        </div>
      </aside>
    </>
  );
}
