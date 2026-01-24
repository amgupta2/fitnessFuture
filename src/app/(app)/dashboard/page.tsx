"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { WorkoutHistoryCard } from "@/components/workouts/WorkoutHistoryCard";
import { Dumbbell, Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const user = useCurrentUser();
  const recentWorkouts = useQuery(
    api.sessions.getWorkoutHistory,
    user ? { userId: user._id, limit: 5 } : "skip"
  );
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const sessionDetails = useQuery(
    api.sessions.getSessionDetails,
    selectedSession ? { sessionId: selectedSession as any } : "skip"
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:wght@400;700&display=swap');

        .athletic-title {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .athletic-body {
          font-family: 'Roboto Condensed', sans-serif;
        }

        .clip-corner {
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="athletic-title text-5xl mb-2 text-lime-400">Dashboard</h1>
          <p className="athletic-body text-zinc-500 uppercase text-sm">
            Track your progress
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/workouts"
            className="clip-corner bg-gradient-to-br from-lime-400 to-lime-500 text-black p-6 hover:from-lime-300 hover:to-lime-400 active:scale-98 transition-all"
          >
            <Dumbbell className="w-8 h-8 mb-3" />
            <div className="athletic-title text-2xl mb-1">Templates</div>
            <div className="athletic-body text-sm opacity-80">
              View and manage workout templates
            </div>
          </Link>

          <Link
            href="/workout-active"
            className="clip-corner bg-zinc-900 border-2 border-lime-400 text-white p-6 hover:bg-lime-400/10 active:scale-98 transition-all"
          >
            <Plus className="w-8 h-8 mb-3 text-lime-400" />
            <div className="athletic-title text-2xl mb-1">Start Workout</div>
            <div className="athletic-body text-sm text-zinc-400">
              Begin training session
            </div>
          </Link>
        </div>

        {/* Recent Workouts */}
        <div className="mb-8">
          <h2 className="athletic-title text-3xl mb-4">Recent Workouts</h2>

          {recentWorkouts && recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((session) => (
                <WorkoutHistoryCard
                  key={session._id}
                  session={session}
                  onClick={() => setSelectedSession(session._id)}
                />
              ))}
            </div>
          ) : (
            <div className="clip-corner bg-zinc-900 border border-zinc-800 p-12 text-center">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p className="athletic-title text-2xl text-zinc-600 mb-2">
                No Workouts Yet
              </p>
              <p className="athletic-body text-zinc-600 mb-6">
                Start your first workout to see your history
              </p>
              <Link
                href="/workouts"
                className="inline-block px-6 py-3 bg-lime-400 text-black athletic-body font-bold uppercase text-sm hover:bg-lime-300 transition-colors"
              >
                Create Template
              </Link>
            </div>
          )}
        </div>

        {/* Session Detail Modal */}
        {selectedSession && sessionDetails && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSession(null)}
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 clip-corner border-2 border-lime-400"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b-2 border-lime-400 bg-zinc-950 p-6 sticky top-0">
                <h2 className="athletic-title text-2xl mb-2">
                  {sessionDetails.templateName}
                </h2>
                <div className="athletic-body text-sm text-zinc-400">
                  {new Date(sessionDetails.completedAt!).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {sessionDetails.exercises.map((exercise) => (
                  <div key={exercise._id} className="bg-black/50 p-4 rounded">
                    <h3 className="athletic-title text-xl mb-3 text-lime-400">
                      {exercise.exerciseName}
                    </h3>
                    <div className="space-y-2">
                      {exercise.sets
                        .filter((s) => !s.isWarmup)
                        .map((set, idx) => (
                          <div
                            key={set._id}
                            className="flex justify-between athletic-body text-sm"
                          >
                            <span className="text-zinc-500">Set {idx + 1}</span>
                            <div className="flex gap-4">
                              <span className="text-white">
                                {set.weight} lbs × {set.reps} reps
                              </span>
                              {set.isPR && (
                                <Trophy className="w-4 h-4 text-lime-400" />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
