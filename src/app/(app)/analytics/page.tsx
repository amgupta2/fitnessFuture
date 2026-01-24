"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { VolumeChart } from "@/components/analytics/VolumeChart";
import { ProgressionChart } from "@/components/analytics/ProgressionChart";
import { StatsCard } from "@/components/analytics/StatsCard";
import { PRList } from "@/components/analytics/PRList";
import { PlateauDetector } from "@/components/analytics/PlateauDetector";
import { RecoveryWidget } from "@/components/analytics/RecoveryWidget";

export default function AnalyticsPage() {
  const user = useCurrentUser();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90 | 365>(30);
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  // Queries
  const stats = useQuery(
    api.analytics.getDashboardStats,
    user ? { userId: user._id, days: timeRange } : "skip"
  );

  const volumeData = useQuery(
    api.analytics.getVolumeOverTime,
    user ? { userId: user._id, days: timeRange } : "skip"
  );

  const exercises = useQuery(
    api.analytics.getUserExercises,
    user ? { userId: user._id } : "skip"
  );

  const progressionData = useQuery(
    api.analytics.getExerciseProgression,
    user && selectedExercise
      ? { userId: user._id, exerciseName: selectedExercise, days: timeRange }
      : "skip"
  );

  const prs = useQuery(
    api.analytics.getPersonalRecords,
    user ? { userId: user._id, limit: 10 } : "skip"
  );

  const plateaus = useQuery(
    api.analytics.detectPlateaus,
    user ? { userId: user._id, minSessions: 3 } : "skip"
  );

  // Recovery data - uncomment after running `npx convex dev` to regenerate APIs
  const recoveryData = useQuery(
    api.recovery.getRecoveryScore,
    user ? { userId: user._id } : "skip"
  );

  if (user === undefined) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">Please log in to view your analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Analytics</h1>

          {/* Time Range Selector */}
          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg border border-gray-700">
            {[
              { value: 7, label: "7D" },
              { value: 30, label: "30D" },
              { value: 90, label: "90D" },
              { value: 365, label: "1Y" },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value as 7 | 30 | 90 | 365)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatsCard
            title="Total Volume"
            value={stats ? `${Math.round(stats.totalVolume / 1000)}K` : "—"}
            subtitle="lbs lifted"
          />
          <StatsCard
            title="Workouts"
            value={stats?.totalWorkouts ?? "—"}
            subtitle={`${timeRange} days`}
          />
          <StatsCard
            title="Total Sets"
            value={stats?.totalSets ?? "—"}
            subtitle="completed"
          />
          <StatsCard
            title="PRs Set"
            value={stats?.prsAchieved ?? "—"}
            subtitle={`${timeRange} days`}
          />
        </div>

        {/* Volume Over Time */}
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">Volume Over Time</h2>
          {volumeData ? (
            <VolumeChart data={volumeData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Loading...
            </div>
          )}
        </div>

        {/* Exercise Progression */}
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
            <h2 className="text-xl font-semibold">Exercise Progression</h2>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an exercise</option>
              {exercises?.map((exercise) => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
            </select>
          </div>
          {selectedExercise ? (
            progressionData ? (
              <ProgressionChart
                data={progressionData}
                exerciseName={selectedExercise}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Loading...
              </div>
            )
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Select an exercise to view progression
            </div>
          )}
        </div>

        {/* Recovery Score (Full Width) */}
        {recoveryData && (
          <RecoveryWidget
            score={recoveryData.score}
            status={recoveryData.status}
            fatigueLevel={recoveryData.fatigueLevel}
            recommendations={recoveryData.recommendations}
            metrics={recoveryData.metrics}
          />
        )}

        {/* Two Column Layout for PRs and Plateaus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Records */}
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Recent PRs</h2>
            {prs ? (
              <PRList records={prs} />
            ) : (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            )}
          </div>

          {/* Plateau Detection */}
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Plateau Detection</h2>
            {plateaus ? (
              <PlateauDetector plateaus={plateaus} />
            ) : (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            )}
          </div>
        </div>

        {/* Metrics Explanation */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            About These Metrics
          </h3>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong className="text-gray-400">Volume:</strong> Total weight
              lifted (weight × reps × sets)
            </p>
            <p>
              <strong className="text-gray-400">Est. 1RM:</strong> Estimated
              one-rep max using the Epley formula: weight × (1 + reps/30)
            </p>
            <p>
              <strong className="text-gray-400">Plateau:</strong> Less than 2.5%
              improvement in estimated 1RM over the last 3+ sessions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
