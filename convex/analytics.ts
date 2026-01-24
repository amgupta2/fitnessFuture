/**
 * Analytics queries for dashboard
 * Provides volume tracking, progression, PRs, and plateau detection
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Calculate estimated 1RM using Epley formula
 * 1RM = weight × (1 + reps/30)
 */
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Get volume over time for a user
 * Returns daily volume for the specified time range
 */
export const getVolumeOverTime = query({
  args: {
    userId: v.id("users"),
    days: v.number(), // 7, 30, 90, or 365
  },
  handler: async (ctx, args) => {
    const startDate = Date.now() - args.days * 24 * 60 * 60 * 1000;

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

    // Group by date
    const volumeByDate = new Map<string, number>();

    for (const session of sessions) {
      const date = new Date(session.completedAt || 0).toISOString().split("T")[0];
      const currentVolume = volumeByDate.get(date) || 0;
      volumeByDate.set(date, currentVolume + (session.totalVolume || 0));
    }

    // Convert to array and sort
    return Array.from(volumeByDate.entries())
      .map(([date, volume]) => ({ date, volume }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

/**
 * Get exercise progression for a specific exercise
 * Returns performance history over time
 */
export const getExerciseProgression = query({
  args: {
    userId: v.id("users"),
    exerciseName: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 90;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get all sessions in range
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

    const progression = [];

    for (const session of sessions) {
      // Get all session exercises for this session
      const allSessionExercises = await ctx.db
        .query("sessionExercises")
        .withIndex("by_session_order", (q) => q.eq("sessionId", session._id))
        .collect();

      // Filter in memory for case-insensitive match
      const sessionExercises = allSessionExercises.filter(
        (se) =>
          se.exerciseName.toLowerCase() === args.exerciseName.toLowerCase()
      );

      for (const sessionExercise of sessionExercises) {
        // Get working sets (exclude warmups)
        const sets = await ctx.db
          .query("sets")
          .withIndex("by_session_exercise", (q) =>
            q.eq("sessionExerciseId", sessionExercise._id)
          )
          .filter((q) => q.eq(q.field("isWarmup"), false))
          .collect();

        if (sets.length === 0) continue;

        // Calculate metrics
        const weights = sets.map((s) => s.weight);
        const reps = sets.map((s) => s.reps);
        const maxWeight = Math.max(...weights);
        const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

        // Calculate best estimated 1RM from this session
        const estimated1RMs = sets.map((s) => calculate1RM(s.weight, s.reps));
        const best1RM = Math.max(...estimated1RMs);

        progression.push({
          date: session.completedAt || 0,
          maxWeight,
          totalVolume,
          estimated1RM: best1RM,
          sets: sets.length,
          avgReps: Math.round(reps.reduce((a, b) => a + b, 0) / reps.length),
        });
      }
    }

    return progression.sort((a, b) => a.date - b.date);
  },
});

/**
 * Get all exercises user has logged
 */
export const getUserExercises = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get recent sessions
    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("completedAt"), undefined))
      .collect();

    const exerciseNames = new Set<string>();

    for (const session of sessions) {
      const sessionExercises = await ctx.db
        .query("sessionExercises")
        .withIndex("by_session_order", (q) => q.eq("sessionId", session._id))
        .collect();

      sessionExercises.forEach((se) => exerciseNames.add(se.exerciseName));
    }

    return Array.from(exerciseNames).sort();
  },
});

/**
 * Get personal records for user
 */
export const getPersonalRecords = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const records = await ctx.db
      .query("personalRecords")
      .withIndex("by_user_current", (q) =>
        q.eq("userId", args.userId).eq("isCurrent", true)
      )
      .order("desc")
      .take(limit);

    // Enrich records with set data (weight and reps)
    const enrichedRecords = await Promise.all(
      records.map(async (record) => {
        if (record.setId) {
          const set = await ctx.db.get(record.setId);
          if (set) {
            return {
              ...record,
              weight: set.weight,
              reps: set.reps,
            };
          }
        }
        // Fallback if no set data available
        return {
          ...record,
          weight: record.value,
          reps: 1,
        };
      })
    );

    return enrichedRecords;
  },
});

/**
 * Detect plateaus for exercises
 * Returns exercises that haven't progressed in the last N sessions
 */
export const detectPlateaus = query({
  args: {
    userId: v.id("users"),
    minSessions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const minSessions = args.minSessions || 3;
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    // Get recent sessions
    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.neq(q.field("completedAt"), undefined),
          q.gte(q.field("completedAt"), ninetyDaysAgo)
        )
      )
      .order("desc")
      .collect();

    // Track performance by exercise
    const exercisePerformance = new Map<
      string,
      Array<{ date: number; max1RM: number }>
    >();

    for (const session of sessions) {
      const sessionExercises = await ctx.db
        .query("sessionExercises")
        .withIndex("by_session_order", (q) => q.eq("sessionId", session._id))
        .collect();

      for (const sessionExercise of sessionExercises) {
        const sets = await ctx.db
          .query("sets")
          .withIndex("by_session_exercise", (q) =>
            q.eq("sessionExerciseId", sessionExercise._id)
          )
          .filter((q) => q.eq(q.field("isWarmup"), false))
          .collect();

        if (sets.length === 0) continue;

        const estimated1RMs = sets.map((s) => calculate1RM(s.weight, s.reps));
        const max1RM = Math.max(...estimated1RMs);

        const exerciseName = sessionExercise.exerciseName;
        if (!exercisePerformance.has(exerciseName)) {
          exercisePerformance.set(exerciseName, []);
        }

        exercisePerformance.get(exerciseName)!.push({
          date: session.completedAt || 0,
          max1RM,
        });
      }
    }

    // Detect plateaus
    const plateaus = [];

    for (const [exerciseName, performances] of exercisePerformance.entries()) {
      if (performances.length < minSessions) continue;

      // Sort by date
      performances.sort((a, b) => a.date - b.date);

      // Get last N sessions
      const recentSessions = performances.slice(-minSessions);

      // Check if 1RM has improved
      const first1RM = recentSessions[0].max1RM;
      const last1RM = recentSessions[recentSessions.length - 1].max1RM;
      const improvement = ((last1RM - first1RM) / first1RM) * 100;

      // Plateau if less than 2.5% improvement
      if (improvement < 2.5) {
        plateaus.push({
          exerciseName,
          sessionsCount: recentSessions.length,
          firstDate: recentSessions[0].date,
          lastDate: recentSessions[recentSessions.length - 1].date,
          first1RM,
          last1RM,
          improvement: Math.round(improvement * 10) / 10,
        });
      }
    }

    return plateaus;
  },
});

/**
 * Get dashboard summary stats
 */
export const getDashboardStats = query({
  args: {
    userId: v.id("users"),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const startDate = Date.now() - args.days * 24 * 60 * 60 * 1000;

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

    const totalVolume = sessions.reduce(
      (sum, s) => sum + (s.totalVolume || 0),
      0
    );
    const totalSets = sessions.reduce((sum, s) => sum + (s.totalSets || 0), 0);
    const totalWorkouts = sessions.length;

    // Get PRs in this period
    const prs = await ctx.db
      .query("personalRecords")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("achievedAt"), startDate))
      .collect();

    return {
      totalVolume,
      totalSets,
      totalWorkouts,
      prsAchieved: prs.length,
      avgVolume: totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0,
    };
  },
});

