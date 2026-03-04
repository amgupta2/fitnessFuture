/**
 * App header
 * User menu and quick actions
 */

"use client";

import { SessionData } from "@/lib/session";
import { LogOut, User, Menu } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  user: SessionData;
  onOpenMobileMenu?: () => void;
}

export function Header({ user, onOpenMobileMenu }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const initial = user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase();

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 border-b shrink-0"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Left: menu button + greeting */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg transition-colors hover:bg-[var(--surface-2)]"
          style={{ color: "var(--text-2)" }}
        >
          <Menu className="w-6 h-6" />
        </button>

        <p className="text-sm truncate" style={{ color: "var(--text-2)" }}>
          Welcome back,{" "}
          <span
            className="font-bold text-base tracking-wide"
            style={{
              fontFamily: "var(--font-brand)",
              color: "var(--text-1)",
              letterSpacing: "0.04em",
            }}
          >
            {user.name || user.email}
          </span>
        </p>
      </div>

      {/* Right: user menu */}
      <div className="relative shrink-0">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 pl-2 pr-3 py-2 rounded-lg transition-colors hover:bg-[var(--surface-2)]"
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: "var(--accent)",
              color: "#0B0B0F",
              fontFamily: "var(--font-brand)",
              letterSpacing: "0.05em",
            }}
          >
            {initial}
          </div>
          <span className="text-xs hidden sm:inline truncate max-w-[140px]" style={{ color: "var(--text-2)" }}>
            {user.email}
          </span>
        </button>

        {/* Dropdown */}
        {isMenuOpen && (
          <div
            className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl z-50 border overflow-hidden"
            style={{ background: "var(--surface-2)", borderColor: "var(--border-2)" }}
          >
            <div className="p-1.5">
              <button
                onClick={() => { window.location.href = "/settings"; }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm hover:bg-[var(--surface)]"
                style={{ color: "var(--text-1)" }}
              >
                <User className="w-4 h-4 shrink-0" style={{ color: "var(--text-2)" }} />
                <span>Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm hover:bg-[var(--surface)]"
                style={{ color: "var(--danger)" }}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
