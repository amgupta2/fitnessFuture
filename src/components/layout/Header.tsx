/**
 * App header
 * User menu and quick actions
 */

"use client";

import { SessionData } from "@/lib/session";
import { LogOut, User, Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

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

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h2 className="text-base lg:text-lg font-semibold truncate">
          Welcome back, {user.name || user.email}
        </h2>
      </div>

      {/* Theme toggle and User menu */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        {/* User menu */}
        <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 px-2 lg:px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-semibold">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <span className="text-sm text-zinc-400 hidden sm:inline">{user.email}</span>
        </button>

        {/* Dropdown */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
            <div className="p-2">
              <button
                onClick={() => {
                  window.location.href = "/settings";
                }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
              >
                <User className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
