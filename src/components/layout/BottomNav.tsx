/**
 * Mobile bottom navigation bar
 * Visible only on screens smaller than lg (< 1024px)
 * Mirrors the desktop sidebar navigation
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  BarChart3,
  Brain,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Home",      href: "/dashboard",  icon: LayoutDashboard },
  { name: "Workouts",  href: "/workouts",   icon: Dumbbell },
  { name: "Analytics", href: "/analytics",  icon: BarChart3 },
  { name: "AI",        href: "/ai",         icon: Brain },
  { name: "Settings",  href: "/settings",   icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-zinc-900 border-t border-zinc-800 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 min-h-[56px] transition-colors ${
              isActive
                ? "text-white"
                : "text-zinc-500 active:text-white"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-lime-400" : ""}`} />
            <span className={`text-[10px] font-medium leading-none ${isActive ? "text-lime-400" : ""}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
