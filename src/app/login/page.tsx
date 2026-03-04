/**
 * Login page
 * WorkOS authentication entry point
 */

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  // Redirect if already logged in
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `
          radial-gradient(ellipse 90% 55% at 50% -5%, rgba(203, 255, 71, 0.06) 0%, transparent 65%),
          var(--bg)
        `,
      }}
    >
      <div className="w-full max-w-md animate-fadeUp">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-[4px] shrink-0"
              style={{ background: "var(--accent)" }}
            />
            <h1
              className="text-[32px] font-bold tracking-[0.2em] uppercase leading-none"
              style={{ fontFamily: "var(--font-brand)", color: "var(--text-1)" }}
            >
              UniFit
            </h1>
          </div>
          <p
            className="text-sm tracking-wide text-center"
            style={{ color: "var(--text-2)" }}
          >
            Where training data, intelligence, and coaching merge
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
