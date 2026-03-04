/**
 * App sidebar navigation
 * Desktop: persistent sidebar. Mobile: slide-in drawer overlay.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  BarChart3,
  Brain,
  ScanLine,
  Settings,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workouts",  href: "/workouts",  icon: Dumbbell },
  { name: "Nutrition", href: "/nutrition", icon: UtensilsCrossed },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Coach",  href: "/ai",        icon: Brain },
  { name: "Form Check",href: "/form-check",icon: ScanLine },
  { name: "Settings",  href: "/settings",  icon: Settings },
];

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

/** Three-bar "volume meter" logomark — represents progress tracking */
function LogoMark() {
  return (
    <div
      className="w-7 h-7 shrink-0 flex items-end gap-[3px] px-[2px] pb-[1px]"
      aria-hidden="true"
    >
      <span
        className="flex-1 rounded-t-[2px] transition-all duration-300"
        style={{ height: "45%", background: "var(--accent)", opacity: 0.45 }}
      />
      <span
        className="flex-1 rounded-t-[2px] transition-all duration-300"
        style={{ height: "70%", background: "var(--accent)", opacity: 0.72 }}
      />
      <span
        className="flex-1 rounded-t-[2px] transition-all duration-300"
        style={{ height: "100%", background: "var(--accent)" }}
      />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <div>
        <h1
          className="text-[19px] font-bold tracking-[0.14em] uppercase leading-none"
          style={{ fontFamily: "var(--font-brand)", color: "var(--text-1)" }}
        >
          UniFit
        </h1>
        <p
          className="text-[9px] tracking-[0.22em] uppercase leading-none mt-[3px] font-medium"
          style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
        >
          Performance
        </p>
      </div>
    </div>
  );
}

function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="space-y-[2px]">
      {navigation.map((item, i) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onLinkClick}
            className={`group flex items-center gap-3 px-3 py-[10px] rounded-xl transition-all duration-200 min-h-[44px] cursor-pointer animate-slideInLeft`}
            style={{
              animationDelay: `${i * 30}ms`,
              background: isActive ? "var(--accent-muted)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-2)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
              }
            }}
          >
            {/* Active left accent bar */}
            {isActive && (
              <span
                className="absolute left-0 w-[3px] h-[22px] rounded-r-full"
                style={{ background: "var(--accent)" }}
              />
            )}

            <Icon
              className="w-[17px] h-[17px] shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{ color: isActive ? "var(--accent)" : "inherit" }}
            />
            <span
              className="text-[13.5px] font-semibold tracking-[0.01em]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {item.name}
            </span>

            {/* Active dot indicator */}
            {isActive && (
              <span
                className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "var(--accent)" }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar({ isMobileMenuOpen, onCloseMobileMenu }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:flex w-[240px] flex-col shrink-0 border-r relative"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Ambient top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none rounded-tl"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,166,35,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="px-5 py-5 border-b relative" style={{ borderColor: "var(--border)" }}>
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 relative overflow-y-auto">
          <NavLinks />
        </nav>

        {/* Footer */}
        <div
          className="px-5 py-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-[9px] tracking-[0.2em] uppercase font-semibold"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
          >
            Train · Analyze · Evolve
          </p>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 animate-fadeIn"
            style={{ background: "rgba(5, 6, 12, 0.8)", backdropFilter: "blur(8px)" }}
            onClick={onCloseMobileMenu}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            className="absolute left-0 top-0 h-full w-[280px] flex flex-col shadow-2xl border-r animate-slideInLeft"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* Ambient glow */}
            <div
              className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,166,35,0.07) 0%, transparent 70%)",
              }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-5 border-b relative"
              style={{ borderColor: "var(--border)" }}
            >
              <Logo />
              <button
                onClick={onCloseMobileMenu}
                className="p-2 rounded-xl transition-colors cursor-pointer"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface-2)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 relative overflow-y-auto">
              <NavLinks onLinkClick={onCloseMobileMenu} />
            </nav>

            {/* Footer */}
            <div
              className="px-5 py-4 border-t"
              style={{
                borderColor: "var(--border)",
                paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
              }}
            >
              <p
                className="text-[9px] tracking-[0.2em] uppercase font-semibold"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
              >
                Train · Analyze · Evolve
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
