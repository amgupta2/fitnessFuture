/**
 * User onboarding flow
 * Collects experience level and preferences
 */

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `
          radial-gradient(ellipse 90% 55% at 50% -5%, rgba(245, 166, 35, 0.06) 0%, transparent 65%),
          var(--bg)
        `,
      }}
    >
      <div className="w-full max-w-2xl animate-fadeUp">
        <div className="text-center mb-10">
          {/* Step label */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase mb-5 border"
            style={{
              color: "var(--accent)",
              borderColor: "rgba(245, 166, 35, 0.25)",
              background: "var(--accent-muted)",
              fontFamily: "var(--font-brand)",
            }}
          >
            Getting Started
          </div>

          <h1
            className="text-4xl font-bold tracking-wide uppercase mb-2"
            style={{ fontFamily: "var(--font-brand)", color: "var(--text-1)" }}
          >
            Welcome to UniFit
          </h1>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Let&apos;s personalize your training experience
          </p>
        </div>

        <OnboardingForm workosId={session.workosId} />
      </div>
    </div>
  );
}
