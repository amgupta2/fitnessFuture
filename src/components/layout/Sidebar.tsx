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
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Workouts",
    href: "/workouts",
    icon: Dumbbell,
  },
  {
    name: "Nutrition",
    href: "/nutrition",
    icon: UtensilsCrossed,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "AI Coach",
    href: "/ai",
    icon: Brain,
  },
  {
    name: "Form Check",
    href: "/form-check",
    icon: ScanLine,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
              isActive
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{item.name}</span>
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
      <div className="hidden lg:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold">Next-Gen Fitness</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">
            Where training data, intelligence, and coaching merge
          </p>
        </div>
      </div>

      {/* Mobile Drawer Overlay — visible when isMobileMenuOpen */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobileMenu}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="absolute left-0 top-0 h-full w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col shadow-2xl">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h1 className="text-xl font-bold">Next-Gen Fitness</h1>
              <button
                onClick={onCloseMobileMenu}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <NavLinks onLinkClick={onCloseMobileMenu} />
            </nav>

            {/* Footer with safe area */}
            <div
              className="p-4 border-t border-zinc-800"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
            >
              <p className="text-xs text-zinc-600">
                Where training data, intelligence, and coaching merge
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
