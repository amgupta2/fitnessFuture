/**
 * Login page
 * WorkOS authentication entry point
 */

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Ambient glow layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,166,35,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 20% 100%, rgba(92,121,224,0.04) 0%, transparent 55%)
          `,
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      <div className="w-full max-w-md relative animate-fadeUp">
        {/* Logo / hero */}
        <div className="flex flex-col items-center mb-10">
          {/* Logo mark — three bars */}
          <div className="flex items-end gap-[4px] mb-5 h-10">
            <span
              className="w-[10px] rounded-t-[3px]"
              style={{ height: "45%", background: "var(--accent)", opacity: 0.4 }}
            />
            <span
              className="w-[10px] rounded-t-[3px]"
              style={{ height: "70%", background: "var(--accent)", opacity: 0.7 }}
            />
            <span
              className="w-[10px] rounded-t-[3px]"
              style={{ height: "100%", background: "var(--accent)" }}
            />
          </div>

          <h1
            className="text-[38px] font-bold tracking-[0.18em] uppercase leading-none mb-2"
            style={{ fontFamily: "var(--font-brand)", color: "var(--text-1)" }}
          >
            UniFit
          </h1>
          <p
            className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-3"
            style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
          >
            Performance Platform
          </p>
          <p
            className="text-[13px] text-center leading-relaxed max-w-[280px]"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
          >
            Where training data, intelligence, and coaching merge
          </p>
        </div>

        <LoginForm />

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-2 mt-8 max-w-[280px] mx-auto">
          {["AI Coaching", "Progress Analytics", "Nutrition Tracking", "Form Analysis"].map((feat) => (
            <span
              key={feat}
              className="text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full border text-center"
              style={{
                color: "var(--text-2)",
                borderColor: "var(--border)",
                background: "var(--surface)",
                fontFamily: "var(--font-body)",
              }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
