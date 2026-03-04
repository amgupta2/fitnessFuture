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
      {/* More menu bottom sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fadeIn"
            style={{ background: "rgba(5, 6, 12, 0.75)", backdropFilter: "blur(8px)" }}
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t animate-fadeUp"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border-2)",
              paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full" style={{ background: "var(--border-2)" }} />
            </div>

            <div className="flex items-center justify-between px-5 py-3">
              <span
                className="text-[11px] font-bold tracking-[0.2em] uppercase"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-brand)" }}
              >
                More
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-lg cursor-pointer transition-colors"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface-2)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-3 pb-2 space-y-[2px]">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-[14px] font-semibold cursor-pointer"
                    style={{
                      background: isActive ? "var(--accent-muted)" : "transparent",
                      color: isActive ? "var(--accent)" : "var(--text-2)",
                      fontFamily: "var(--font-body)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
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
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Subtle amber top-line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.3) 40%, rgba(245,166,35,0.1) 80%, transparent)",
          }}
        />

        <div className="flex items-stretch">
          {primaryNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-[5px] min-h-[58px] transition-all duration-200 relative cursor-pointer"
                style={{ color: isActive ? "var(--accent)" : "var(--text-2)" }}
              >
                {/* Active pill background */}
                {isActive && (
                  <span
                    className="absolute inset-x-1 inset-y-1 rounded-2xl"
                    style={{ background: "var(--accent-muted)" }}
                  />
                )}
                <Icon className="w-[20px] h-[20px] relative z-10" />
                <span
                  className="text-[9px] font-bold leading-none tracking-[0.12em] uppercase relative z-10"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-[5px] min-h-[58px] transition-all duration-200 relative cursor-pointer"
            style={{ color: isMoreActive ? "var(--accent)" : "var(--text-3)" }}
          >
            {isMoreActive && (
              <span
                className="absolute inset-x-1 inset-y-1 rounded-2xl"
                style={{ background: "var(--accent-muted)" }}
              />
            )}
            <MoreHorizontal className="w-[20px] h-[20px] relative z-10" />
            <span
              className="text-[9px] font-bold leading-none tracking-[0.12em] uppercase relative z-10"
              style={{ fontFamily: "var(--font-body)" }}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
