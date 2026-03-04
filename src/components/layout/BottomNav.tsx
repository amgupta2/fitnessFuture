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
  { name: "Nutrition", href: "/nutrition",  icon: UtensilsCrossed },
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
      {/* More menu sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t p-4"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[11px] font-bold tracking-[0.2em] uppercase"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-brand)" }}
              >
                More
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                style={{ color: "var(--text-2)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-0.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm font-medium tracking-wide ${
                      isActive
                        ? "bg-[var(--accent-muted)] text-[var(--accent)] shadow-[inset_2px_0_0_var(--accent)]"
                        : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t flex items-stretch"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {primaryNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 min-h-[56px] transition-colors relative ${
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-3)] active:text-[var(--text-1)]"
              }`}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-b-full"
                  style={{ background: "var(--accent)" }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold leading-none tracking-wider uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 min-h-[56px] transition-colors relative ${
            isMoreActive
              ? "text-[var(--accent)]"
              : "text-[var(--text-3)] active:text-[var(--text-1)]"
          }`}
        >
          {isMoreActive && (
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-b-full"
              style={{ background: "var(--accent)" }}
            />
          )}
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold leading-none tracking-wider uppercase">More</span>
        </button>
      </nav>
    </>
  );
}
