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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to Next-Gen Fitness
          </h1>
          <p className="text-zinc-400">
            Let&apos;s personalize your training experience
          </p>
        </div>

        <OnboardingForm workosId={session.workosId} />
      </div>
    </div>
  );
}
