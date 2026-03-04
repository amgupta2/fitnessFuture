/**
 * AI Coach page
 * Workout programmer and training advice
 */

"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import ChatInterface from "@/components/ai/ChatInterface";

export default function AICoachPage() {
  const user = useCurrentUser();

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">AI Workout Programmer</h1>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-12 text-center">
            <p className="text-[var(--text-2)]">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-0 lg:pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Coach</h1>
          <p className="text-[var(--text-2)]">
            Ask training questions or request workout templates—I&apos;m here to help
          </p>
        </div>

        <ChatInterface userId={user._id} />
      </div>
    </div>
  );
}
