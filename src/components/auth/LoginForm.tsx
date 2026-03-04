/**
 * Login form component
 * Initiates WorkOS authentication flow
 */

"use client";

import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div
      className="rounded-2xl border p-7"
      style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}
    >
      {error && (
        <div
          className="mb-5 p-4 rounded-xl border text-[13px] font-medium"
          style={{
            background: "rgba(244,63,94,0.07)",
            borderColor: "rgba(244,63,94,0.2)",
            color: "var(--danger)",
            fontFamily: "var(--font-body)",
          }}
        >
          {error === "no_code" && "Authentication failed — no code received."}
          {error === "auth_failed" && "Authentication failed — please try again."}
          {!["no_code", "auth_failed"].includes(error) && "An error occurred during login."}
        </div>
      )}

      <button
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-bold text-[14px] tracking-[0.06em] uppercase transition-all duration-200 cursor-pointer group"
        style={{
          background: "var(--accent)",
          color: "#090B12",
          fontFamily: "var(--font-brand)",
          letterSpacing: "0.1em",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.filter = "brightness(1.08)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(245,166,35,0.3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.filter = "brightness(1)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        Continue with WorkOS
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>

      <p
        className="text-[11px] text-center mt-5 leading-relaxed"
        style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
      >
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
