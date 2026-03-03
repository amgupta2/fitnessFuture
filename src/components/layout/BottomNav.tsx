/**
 * Mobile bottom navigation bar
 * Visible only on screens smaller than lg (< 1024px)
 * Primary tabs + "More" overflow for less-frequent features
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  Brain,
  MoreHorizontal,
  BarChart3,
  ScanLine,
  Settings,
  X,
} from "lucide-react";

const primaryNav = [
  { name: "Home",      href: "/dashboard",  icon: LayoutDashboard },
  { name: "Workouts",  href: "/workouts",   icon: Dumbbell },
  { name: "Nutrition", href: "/nutrition",   icon: UtensilsCrossed },
  { name: "AI",        href: "/ai",         icon: Brain },
];

const moreItems = [
  { name: "Analytics",  href: "/analytics",  icon: BarChart3 },
  { name: "Form Check", href: "/form-check", icon: ScanLine },
  { name: "Settings",   href: "/settings",   icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreItems.some((item) => pathname === item.href);

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-4 pb-0"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-400">More</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 pb-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-lime-400" : ""}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-zinc-900 border-t border-zinc-800 flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {primaryNav.map((item) => {
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

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 min-h-[56px] transition-colors ${
            isMoreActive
              ? "text-white"
              : "text-zinc-500 active:text-white"
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? "text-lime-400" : ""}`} />
          <span className={`text-[10px] font-medium leading-none ${isMoreActive ? "text-lime-400" : ""}`}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}
