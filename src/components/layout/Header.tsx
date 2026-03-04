/**
 * App header
 * User menu and quick actions
 */

"use client";

import { SessionData } from "@/lib/session";
import { LogOut, User, Menu, ChevronDown } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  user: SessionData;
  onOpenMobileMenu?: () => void;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 5)  return "Late night session";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Evening session";
}

export function Header({ user, onOpenMobileMenu }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const initial = user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase();
  const displayName = user.name || user.email.split("@")[0];

  return (
    <header
      className="h-[60px] flex items-center justify-between px-4 lg:px-6 shrink-0 relative"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Subtle amber top-line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.4) 40%, rgba(245,166,35,0.15) 80%, transparent)",
        }}
      />

      {/* Left: hamburger + greeting */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl transition-colors cursor-pointer"
          style={{ color: "var(--text-2)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
          }}
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 hidden sm:block">
          <p className="text-[11px] uppercase tracking-[0.15em] font-semibold leading-none mb-[3px]"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>
            {getTimeGreeting()}
          </p>
          <p
            className="text-[15px] font-bold leading-none truncate"
            style={{ fontFamily: "var(--font-brand)", color: "var(--text-1)", letterSpacing: "0.02em" }}
          >
            {displayName}
          </p>
        </div>
      </div>

      {/* Right: user menu */}
      <div className="relative shrink-0">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
          style={{
            background: isMenuOpen ? "var(--surface-2)" : "transparent",
            border: "1px solid",
            borderColor: isMenuOpen ? "var(--border-2)" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!isMenuOpen) {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isMenuOpen) {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            }
          }}
          aria-label="User menu"
          aria-expanded={isMenuOpen}
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-bold shrink-0 relative"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)",
              color: "#0A0B12",
              fontFamily: "var(--font-brand)",
              letterSpacing: "0.05em",
            }}
          >
            {initial}
          </div>

          <span
            className="text-[12px] font-semibold hidden sm:inline truncate max-w-[120px]"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
          >
            {user.email}
          </span>

          <ChevronDown
            className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 hidden sm:block"
            style={{
              color: "var(--text-2)",
              transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {/* Dropdown */}
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl z-50 border overflow-hidden animate-scaleIn"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border-2)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--border-2)",
              }}
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <p
                  className="text-[13px] font-bold truncate"
                  style={{ color: "var(--text-1)", fontFamily: "var(--font-brand)" }}
                >
                  {displayName}
                </p>
                <p
                  className="text-[11px] truncate mt-0.5"
                  style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                >
                  {user.email}
                </p>
              </div>

              <div className="p-1.5">
                <button
                  onClick={() => { window.location.href = "/settings"; }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left text-[13px] cursor-pointer font-medium"
                  style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface-3)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <User className="w-4 h-4 shrink-0" style={{ color: "var(--text-2)" }} />
                  <span>Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left text-[13px] cursor-pointer font-medium"
                  style={{ color: "var(--danger)", fontFamily: "var(--font-body)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.08)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
