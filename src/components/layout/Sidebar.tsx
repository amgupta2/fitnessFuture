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

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-6 h-6 shrink-0 rounded-[3px]"
        style={{ background: "var(--accent)" }}
      />
      <h1
        className="text-[18px] font-bold tracking-[0.22em] uppercase"
        style={{ fontFamily: "var(--font-brand)", color: "var(--text-1)" }}
      >
        UniFit
      </h1>
    </div>
  );
}

function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-4 py-[11px] rounded-lg transition-all duration-150 min-h-[46px] text-sm font-medium ${
              isActive
                ? "bg-[var(--accent-muted)] text-[var(--accent)] shadow-[inset_2px_0_0_var(--accent)]"
                : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <Icon className="w-[17px] h-[17px] shrink-0" />
            <span className="tracking-wide">{item.name}</span>
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar({ isMobileMenuOpen, onCloseMobileMenu }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar — always visible on lg+ */}
      <div
        className="hidden lg:flex w-64 flex-col shrink-0 border-r"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Logo */}
        <div
          className="p-6 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-0.5">
          <NavLinks />
        </nav>

        {/* Footer */}
        <div className="p-5 border-t" style={{ borderColor: "var(--border)" }}>
          <p
            className="text-[10px] tracking-[0.18em] uppercase font-medium"
            style={{ color: "var(--text-3)" }}
          >
            Training · Intelligence · Progress
          </p>
        </div>
      </div>

      {/* Mobile Drawer Overlay — visible when isMobileMenuOpen */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={onCloseMobileMenu}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            className="absolute left-0 top-0 h-full w-72 flex flex-col shadow-2xl border-r"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* Header with close button */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <Logo />
              <button
                onClick={onCloseMobileMenu}
                className="p-2 rounded-lg transition-colors hover:bg-[var(--surface-2)]"
                style={{ color: "var(--text-2)" }}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
              <NavLinks onLinkClick={onCloseMobileMenu} />
            </nav>

            {/* Footer with safe area */}
            <div
              className="p-5 border-t"
              style={{
                borderColor: "var(--border)",
                paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
              }}
            >
              <p
                className="text-[10px] tracking-[0.18em] uppercase font-medium"
                style={{ color: "var(--text-3)" }}
              >
                Training · Intelligence · Progress
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
