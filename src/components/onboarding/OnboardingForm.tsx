"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OnboardingFormProps {
  workosId: string;
}

export function OnboardingForm({ workosId }: OnboardingFormProps) {
  const router = useRouter();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [experienceLevel, setExperienceLevel] = useState<
    "beginner" | "intermediate" | "advanced" | null
  >(null);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("lbs");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!experienceLevel) {
      return;
    }

    setIsSubmitting(true);

    try {
      await completeOnboarding({
        workosId,
        experienceLevel,
        weightUnit,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Onboarding error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Experience Level */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <label className="block text-white font-semibold mb-4">
          What&apos;s your training experience?
        </label>

        <div className="space-y-3">
          {[
            {
              value: "beginner" as const,
              label: "Beginner",
              description: "Less than 6 months of consistent training",
            },
            {
              value: "intermediate" as const,
              label: "Intermediate",
              description: "6 months to 2 years of training",
            },
            {
              value: "advanced" as const,
              label: "Advanced",
              description: "2+ years with structured programming",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setExperienceLevel(option.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                experienceLevel === option.value
                  ? "border-white bg-white/5"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="font-semibold text-white">{option.label}</div>
              <div className="text-sm text-zinc-400">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Weight Unit */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <label className="block text-white font-semibold mb-4">
          Preferred weight unit
        </label>

        <div className="flex gap-3">
          {[
            { value: "lbs" as const, label: "Pounds (lbs)" },
            { value: "kg" as const, label: "Kilograms (kg)" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setWeightUnit(option.value)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                weightUnit === option.value
                  ? "border-white bg-white/5"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="font-semibold text-white">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!experienceLevel || isSubmitting}
        className="w-full bg-white text-black font-semibold py-4 px-6 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Setting up..." : "Continue to Dashboard"}
      </button>
    </form>
  );
}
