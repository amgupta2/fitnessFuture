/**
 * Protected app layout
 * Sidebar navigation + main content area
 * On mobile: bottom nav bar replaces sidebar
 * On workout-active: full-screen, no nav
 */

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useCurrentUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  if (!user) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--bg)", color: "var(--text-2)" }}
      >
        <p className="text-sm font-medium tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>
          Loading…
        </p>
      </div>
    );
  }

  // Workout active page is full-screen — hide all navigation chrome
  const isWorkoutActive = pathname === "/workout-active";

  return (
    <div className="flex h-screen" style={{ background: "var(--bg)", color: "var(--text-1)" }}>
      {/* Sidebar — desktop always-visible + mobile drawer */}
      {!isWorkoutActive && (
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header — hidden on workout-active (has its own header) */}
        {!isWorkoutActive && (
          <Header
            user={{ workosId: user._id, name: user.name || undefined, email: user.email, accessToken: "" }}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
        )}

        {/* Page content — pb-16 on mobile clears the bottom nav bar */}
        <main
          className={`flex-1 overflow-y-auto ${!isWorkoutActive ? "pb-16 lg:pb-0" : ""}`}
          style={{ background: "var(--bg)" }}
        >
          {children}
        </main>
      </div>

      {/* Bottom Navigation — mobile only, not on workout-active */}
      {!isWorkoutActive && <BottomNav />}
    </div>
  );
}
