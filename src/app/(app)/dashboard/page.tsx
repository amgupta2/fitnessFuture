"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { WorkoutHistoryCard } from "@/components/workouts/WorkoutHistoryCard";
import { Dumbbell, Plus, Trophy, X, Zap } from "lucide-react";
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
    <div className="min-h-screen p-5 lg:p-8" style={{ color: "var(--text-1)" }}>
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header ── */}
        <div className="mb-8 animate-fadeUp">
          <div className="flex items-end gap-3 mb-1">
            <h1
              className="text-4xl lg:text-5xl font-bold uppercase leading-none"
              style={{ fontFamily: "var(--font-brand)", letterSpacing: "0.03em" }}
            >
              Dashboard
            </h1>
            <span
              className="text-[11px] font-bold tracking-[0.2em] uppercase mb-1.5 px-2 py-1 rounded-lg"
              style={{
                background: "var(--accent-muted)",
                color: "var(--accent)",
                fontFamily: "var(--font-body)",
              }}
            >
              Overview
            </span>
          </div>
          <p
            className="text-[13px] tracking-[0.08em] uppercase"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
          >
            Track your progress and start training
          </p>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Templates card */}
          <Link
            href="/workouts"
            className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 animate-fadeUp delay-50 cursor-pointer block"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(245,166,35,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.5) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            {/* Corner shine */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20"
              style={{ background: "rgba(255,255,255,0.4)" }}
            />
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(0,0,0,0.15)" }}
              >
                <Dumbbell className="w-5 h-5" style={{ color: "#0A0B12" }} />
              </div>
              <div
                className="text-[22px] font-bold mb-1 uppercase leading-tight"
                style={{ fontFamily: "var(--font-brand)", color: "#0A0B12", letterSpacing: "0.03em" }}
              >
                Templates
              </div>
              <div
                className="text-[13px] font-medium"
                style={{ color: "rgba(10,11,18,0.65)", fontFamily: "var(--font-body)" }}
              >
                View and manage workout templates
              </div>
            </div>
          </Link>

          {/* Start Workout card */}
          <Link
            href="/workout-active"
            className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 border animate-fadeUp delay-100 cursor-pointer block"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border-2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(245,166,35,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* Subtle background glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
              style={{
                background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(245,166,35,0.06) 0%, transparent 70%)",
              }}
            />
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
                style={{
                  background: "var(--accent-muted)",
                  borderColor: "rgba(245,166,35,0.2)",
                }}
              >
                <Zap className="w-5 h-5" style={{ color: "var(--accent)" }} />
              </div>
              <div
                className="text-[22px] font-bold mb-1 uppercase leading-tight"
                style={{ fontFamily: "var(--font-brand)", color: "var(--text-1)", letterSpacing: "0.03em" }}
              >
                Start Workout
              </div>
              <div
                className="text-[13px] font-medium"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
              >
                Begin a training session now
              </div>
            </div>
          </Link>
        </div>

        {/* ── Recent Workouts ── */}
        <div className="animate-fadeUp delay-150">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-2xl font-bold uppercase"
              style={{ fontFamily: "var(--font-brand)", letterSpacing: "0.04em" }}
            >
              Recent Workouts
            </h2>
            <Link
              href="/workouts"
              className="text-[12px] font-bold tracking-[0.12em] uppercase transition-colors cursor-pointer"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
            >
              See all
            </Link>
          </div>

          {recentWorkouts && recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((session, i) => (
                <div
                  key={session._id}
                  className="animate-fadeUp"
                  style={{ animationDelay: `${200 + i * 50}ms` }}
                >
                  <WorkoutHistoryCard
                    session={session}
                    onClick={() => setSelectedSession(session._id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl border p-12 text-center"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }}
              >
                <Dumbbell className="w-8 h-8" style={{ color: "var(--text-3)" }} />
              </div>
              <p
                className="text-xl font-bold uppercase mb-2"
                style={{ fontFamily: "var(--font-brand)", color: "var(--text-2)", letterSpacing: "0.05em" }}
              >
                No Workouts Yet
              </p>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
              >
                Start your first workout to see your history here
              </p>
              <Link
                href="/workouts"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all cursor-pointer"
                style={{
                  background: "var(--accent)",
                  color: "#0A0B12",
                  fontFamily: "var(--font-brand)",
                  letterSpacing: "0.1em",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.filter = "brightness(1)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <Plus className="w-4 h-4" />
                Create Template
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* ── Session Detail Modal ── */}
      {selectedSession && sessionDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5, 6, 12, 0.88)", backdropFilter: "blur(10px)" }}
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl animate-scaleIn"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border-2)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="px-6 py-5 border-b sticky top-0 flex items-center justify-between"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div>
                <h2
                  className="text-xl font-bold uppercase mb-0.5"
                  style={{ fontFamily: "var(--font-brand)", letterSpacing: "0.05em" }}
                >
                  {sessionDetails.templateName}
                </h2>
                <p
                  className="text-[12px] font-medium"
                  style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                >
                  {new Date(sessionDetails.completedAt!).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 rounded-xl transition-colors cursor-pointer"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface-2)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              {sessionDetails.exercises.map((exercise) => (
                <div
                  key={exercise._id}
                  className="rounded-xl p-4 border"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                >
                  <h3
                    className="text-base font-bold uppercase mb-3"
                    style={{
                      fontFamily: "var(--font-brand)",
                      color: "var(--accent)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {exercise.exerciseName}
                  </h3>
                  <div className="space-y-2">
                    {exercise.sets
                      .filter((s) => !s.isWarmup)
                      .map((set, idx) => (
                        <div
                          key={set._id}
                          className="flex justify-between items-center text-[13px]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          <span style={{ color: "var(--text-2)" }}>Set {idx + 1}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold" style={{ color: "var(--text-1)" }}>
                              {set.weight} lbs × {set.reps} reps
                            </span>
                            {set.isPR && (
                              <Trophy className="w-4 h-4" style={{ color: "var(--accent)" }} />
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
  );
}
