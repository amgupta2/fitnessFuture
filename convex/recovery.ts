/**
 * Recovery & Fatigue Monitoring
 * Calculates readiness scores and detects overtraining
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Calculate recovery & readiness score (0-100)
 * Based on volume, intensity, frequency, and rest
 */
export const getRecoveryScore = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

    // Get sessions from last 7 days
    const recentSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.neq(q.field("completedAt"), undefined),
          q.gte(q.field("completedAt"), sevenDaysAgo)
        )
      )
      .collect();

    // Get sessions from previous 7 days (7-14 days ago)
    const previousWeekSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.neq(q.field("completedAt"), undefined),
          q.gte(q.field("completedAt"), fourteenDaysAgo),
          q.lt(q.field("completedAt"), sevenDaysAgo)
        )
      )
      .collect();

    // Calculate metrics
    const currentVolume = recentSessions.reduce(
      (sum, s) => sum + (s.totalVolume || 0),
      0
    );
    const previousVolume = previousWeekSessions.reduce(
      (sum, s) => sum + (s.totalVolume || 0),
      0
    );
    const currentWorkouts = recentSessions.length;
    const previousWorkouts = previousWeekSessions.length;

    // Calculate volume change
    const volumeChange =
      previousVolume > 0
        ? ((currentVolume - previousVolume) / previousVolume) * 100
        : 0;

    // Calculate workout frequency change
    const frequencyChange =
      previousWorkouts > 0
        ? ((currentWorkouts - previousWorkouts) / previousWorkouts) * 100
        : 0;

    // Calculate days since last workout
    const lastWorkoutDate =
      recentSessions.length > 0
        ? Math.max(...recentSessions.map((s) => s.completedAt || 0))
        : 0;
    const daysSinceLastWorkout = lastWorkoutDate
      ? Math.floor((now - lastWorkoutDate) / (24 * 60 * 60 * 1000))
      : 7;

    // Calculate PR count in last 7 days
    const prs = await ctx.db
      .query("personalRecords")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("achievedAt"), sevenDaysAgo))
      .collect();

    // SCORING ALGORITHM
    let score = 70; // Start at 70 (neutral)
    let fatigueLevel: "low" | "moderate" | "high" | "critical" = "low";
    let recommendations: string[] = [];

    // Factor 1: Volume spike (negative impact if too high)
    if (volumeChange > 50) {
      score -= 20;
      recommendations.push("Volume increased significantly. Monitor recovery.");
      fatigueLevel = "high";
    } else if (volumeChange > 25) {
      score -= 10;
      recommendations.push("Slightly elevated training volume.");
      fatigueLevel = "moderate";
    } else if (volumeChange < -30) {
      score += 10;
      recommendations.push("Good deload week. Recovery should be high.");
    }

    // Factor 2: Frequency (too many or too few workouts)
    if (currentWorkouts >= 6) {
      score -= 15;
      recommendations.push("High training frequency. Consider rest days.");
      fatigueLevel = fatigueLevel === "high" ? "critical" : "high";
    } else if (currentWorkouts >= 5) {
      score -= 5;
      fatigueLevel = fatigueLevel === "low" ? "moderate" : fatigueLevel;
    } else if (currentWorkouts <= 2 && daysSinceLastWorkout <= 3) {
      score += 15;
      recommendations.push("Well-rested. Good time for hard training.");
    }

    // Factor 3: Rest days
    if (daysSinceLastWorkout === 0) {
      score -= 10;
      recommendations.push("No rest since last workout. Consider active recovery.");
    } else if (daysSinceLastWorkout === 1) {
      score += 5;
    } else if (daysSinceLastWorkout >= 2 && daysSinceLastWorkout <= 3) {
      score += 10;
      recommendations.push("Optimal rest period. Ready for intense training.");
    } else if (daysSinceLastWorkout >= 5) {
      score -= 5;
      recommendations.push("Extended break. Ease back into training.");
    }

    // Factor 4: PR performance (indicator of good recovery)
    if (prs.length >= 3) {
      score += 10;
      recommendations.push(`${prs.length} PRs this week! Training stimulus is working.`);
    } else if (prs.length === 0 && currentWorkouts >= 3) {
      score -= 5;
      fatigueLevel = fatigueLevel === "low" ? "moderate" : fatigueLevel;
    }

    // Factor 5: Volume consistency (dramatic changes are bad)
    if (Math.abs(volumeChange) > 40) {
      score -= 10;
      recommendations.push("Large volume fluctuations. Aim for consistency.");
    }

    // Cap score at 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine status
    let status: "excellent" | "good" | "moderate" | "poor" | "critical" =
      "good";
    if (score >= 85) status = "excellent";
    else if (score >= 70) status = "good";
    else if (score >= 50) status = "moderate";
    else if (score >= 30) status = "poor";
    else status = "critical";

    // Auto deload recommendation
    if (status === "poor" || status === "critical") {
      recommendations.unshift("⚠️ Consider a deload week (50-60% volume).");
    }

    return {
      score: Math.round(score),
      status,
      fatigueLevel,
      recommendations,
      metrics: {
        currentVolume,
        previousVolume,
        volumeChange: Math.round(volumeChange),
        currentWorkouts,
        previousWorkouts,
        daysSinceLastWorkout,
        prsThisWeek: prs.length,
      },
    };
  },
});

/**
 * Get detailed fatigue breakdown by muscle group
 */
export const getMuscleGroupFatigue = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.neq(q.field("completedAt"), undefined),
          q.gte(q.field("completedAt"), startDate)
        )
      )
      .collect();

    // Track volume by muscle group (approximated from exercise names)
    const muscleGroupVolume: Record<string, number> = {};

    for (const session of sessions) {
      const sessionExercises = await ctx.db
        .query("sessionExercises")
        .withIndex("by_session_order", (q) => q.eq("sessionId", session._id))
        .collect();

      for (const sessionExercise of sessionExercises) {
        // Try to find in exercise library
        const exercise = await ctx.db
          .query("exerciseLibrary")
          .filter((q) =>
            q.eq(
              q.field("name").toLowerCase(),
              sessionExercise.exerciseName.toLowerCase()
            )
          )
          .first();

        const sets = await ctx.db
          .query("sets")
          .withIndex("by_session_exercise", (q) =>
            q.eq("sessionExerciseId", sessionExercise._id)
          )
          .filter((q) => q.eq(q.field("isWarmup"), false))
          .collect();

        const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

        if (exercise && exercise.muscleGroups) {
          exercise.muscleGroups.forEach((muscle) => {
            muscleGroupVolume[muscle] =
              (muscleGroupVolume[muscle] || 0) + volume;
          });
        }
      }
    }

    // Convert to array and sort by volume
    const fatigue = Object.entries(muscleGroupVolume)
      .map(([muscle, volume]) => ({
        muscleGroup: muscle,
        volume,
        fatigueLevel:
          volume > 50000
            ? "high"
            : volume > 25000
            ? "moderate"
            : ("low" as "high" | "moderate" | "low"),
      }))
      .sort((a, b) => b.volume - a.volume);

    return fatigue;
  },
});

/**
 * Check if user needs a deload week
 */
export const needsDeload = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.neq(q.field("completedAt"), undefined),
          q.gte(q.field("completedAt"), fourWeeksAgo)
        )
      )
      .collect();

    // Check for declining performance (PRs)
    const recentPRs = await ctx.db
      .query("personalRecords")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("achievedAt"), fourWeeksAgo))
      .collect();

    const totalSessions = sessions.length;
    const avgVolume =
      sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0) /
      Math.max(totalSessions, 1);

    // Indicators for deload
    const indicators = [];
    let deloadScore = 0;

    // 1. High training frequency (>5 sessions/week for 4 weeks)
    if (totalSessions >= 20) {
      indicators.push("Very high training frequency (4+ weeks)");
      deloadScore += 30;
    }

    // 2. No PRs in last 2 weeks
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const recentPRCount = recentPRs.filter(
      (pr) => pr.achievedAt >= twoWeeksAgo
    ).length;
    if (recentPRCount === 0 && totalSessions >= 6) {
      indicators.push("No PRs in last 2 weeks despite consistent training");
      deloadScore += 25;
    }

    // 3. Very high average volume
    if (avgVolume > 40000) {
      indicators.push("Sustained high training volume");
      deloadScore += 20;
    }

    // 4. Get recovery score
    const recovery = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("completedAt"), undefined))
      .order("desc")
      .first();

    const shouldDeload = deloadScore >= 50;

    return {
      shouldDeload,
      deloadScore,
      indicators,
      recommendation: shouldDeload
        ? "Take a deload week: Reduce volume by 40-50% or take 3-4 rest days."
        : "Recovery looks good. Continue training as planned.",
    };
  },
});

