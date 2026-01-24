/**
 * Progression & Auto-Advancement System
 * Analyzes training history to suggest weight/rep increases
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Calculate estimated 1RM using Epley formula
 */
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Analyze exercise progression over recent sessions
 * Returns actionable suggestions for next workout
 */
export const getProgressionSuggestion = query({
  args: {
    userId: v.id("users"),
    exerciseName: v.string(),
    targetSets: v.number(),
    targetRepsMin: v.number(),
    targetRepsMax: v.number(),
  },
  handler: async (ctx, args) => {
    // Get last 3 sessions for this exercise
    const recentSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("completedAt"), undefined))
      .order("desc")
      .take(50); // Get more to filter

    const exerciseHistory = [];

    for (const session of recentSessions) {
      const sessionExercises = await ctx.db
        .query("sessionExercises")
        .withIndex("by_session_order", (q) => q.eq("sessionId", session._id))
        .collect();

      const matching = sessionExercises.filter(
        (se) =>
          se.exerciseName.toLowerCase() === args.exerciseName.toLowerCase()
      );

      for (const sessionExercise of matching) {
        const sets = await ctx.db
          .query("sets")
          .withIndex("by_session_exercise", (q) =>
            q.eq("sessionExerciseId", sessionExercise._id)
          )
          .filter((q) => q.eq(q.field("isWarmup"), false))
          .collect();

        if (sets.length > 0) {
          exerciseHistory.push({
            date: session.completedAt!,
            sets: sets.map((s) => ({
              weight: s.weight,
              reps: s.reps,
              estimated1RM: calculate1RM(s.weight, s.reps),
            })),
          });
        }
      }

      if (exerciseHistory.length >= 3) break;
    }

    if (exerciseHistory.length === 0) {
      return {
        hasHistory: false,
        suggestion: null,
        confidence: 0,
        reasoning: "No history available for this exercise.",
      };
    }

    // Sort by date (most recent first)
    exerciseHistory.sort((a, b) => b.date - a.date);

    // Analyze progression pattern
    const lastSession = exerciseHistory[0];
    const avgWeight =
      lastSession.sets.reduce((sum, s) => sum + s.weight, 0) /
      lastSession.sets.length;
    const avgReps =
      lastSession.sets.reduce((sum, s) => sum + s.reps, 0) /
      lastSession.sets.length;
    const maxReps = Math.max(...lastSession.sets.map((s) => s.reps));
    const minReps = Math.min(...lastSession.sets.map((s) => s.reps));
    const avgEstimated1RM =
      lastSession.sets.reduce((sum, s) => sum + s.estimated1RM, 0) /
      lastSession.sets.length;

    // Compare to previous session if available
    let improvement = 0;
    if (exerciseHistory.length >= 2) {
      const previousSession = exerciseHistory[1];
      const prevAvg1RM =
        previousSession.sets.reduce((sum, s) => sum + s.estimated1RM, 0) /
        previousSession.sets.length;
      improvement = ((avgEstimated1RM - prevAvg1RM) / prevAvg1RM) * 100;
    }

    // Determine suggestion using double progression
    let suggestionType:
      | "increase_weight"
      | "increase_reps"
      | "maintain"
      | "deload" = "maintain";
    let suggestedWeight = avgWeight;
    let suggestedReps = { min: args.targetRepsMin, max: args.targetRepsMax };
    let confidence = 0;
    let reasoning = "";

    // Rule 1: If all sets hit top of rep range consistently
    if (minReps >= args.targetRepsMax) {
      suggestionType = "increase_weight";
      suggestedWeight = Math.round((avgWeight * 1.025) / 5) * 5; // 2.5% increase, rounded to nearest 5
      confidence = 85;
      reasoning = `You hit ${args.targetRepsMax}+ reps on all sets. Time to add weight!`;
    }
    // Rule 2: If reps are within range, increase reps
    else if (
      avgReps >= args.targetRepsMin &&
      avgReps < args.targetRepsMax - 1
    ) {
      suggestionType = "increase_reps";
      confidence = 70;
      reasoning = `Aim for ${Math.ceil(avgReps) + 1}-${args.targetRepsMax} reps to build up to a weight increase.`;
    }
    // Rule 3: If performance is declining
    else if (improvement < -5 && exerciseHistory.length >= 2) {
      suggestionType = "deload";
      suggestedWeight = Math.round((avgWeight * 0.9) / 5) * 5; // 10% reduction
      confidence = 75;
      reasoning = `Performance dropped ${Math.abs(Math.round(improvement))}%. Consider a deload week.`;
    }
    // Rule 4: Maintain if progressing slowly but steadily
    else {
      suggestionType = "maintain";
      confidence = 60;
      reasoning = `Keep working with ${Math.round(avgWeight)} lbs. Focus on consistency.`;
    }

    return {
      hasHistory: true,
      suggestion: {
        type: suggestionType,
        weight: suggestedWeight,
        reps: suggestedReps,
      },
      confidence,
      reasoning,
      lastSession: {
        date: lastSession.date,
        avgWeight,
        avgReps: Math.round(avgReps * 10) / 10,
        avgEstimated1RM: Math.round(avgEstimated1RM),
      },
      trend: exerciseHistory.length >= 2 ? improvement : null,
    };
  },
});

/**
 * Get progressive overload indicator for a logged set
 * Compares to the same set from previous session
 */
export const getOverloadIndicator = query({
  args: {
    userId: v.id("users"),
    exerciseName: v.string(),
    setNumber: v.number(),
    currentWeight: v.number(),
    currentReps: v.number(),
  },
  handler: async (ctx, args) => {
    // Get last session with this exercise
    const recentSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("completedAt"), undefined))
      .order("desc")
      .take(20);

    for (const session of recentSessions) {
      const sessionExercises = await ctx.db
        .query("sessionExercises")
        .withIndex("by_session_order", (q) => q.eq("sessionId", session._id))
        .collect();

      const matching = sessionExercises.filter(
        (se) =>
          se.exerciseName.toLowerCase() === args.exerciseName.toLowerCase()
      );

      for (const sessionExercise of matching) {
        const sets = await ctx.db
          .query("sets")
          .withIndex("by_session_exercise", (q) =>
            q.eq("sessionExerciseId", sessionExercise._id)
          )
          .filter((q) => q.eq(q.field("isWarmup"), false))
          .collect();

        // Find the corresponding set number
        if (sets.length >= args.setNumber) {
          const previousSet = sets[args.setNumber - 1];
          const current1RM = calculate1RM(args.currentWeight, args.currentReps);
          const previous1RM = calculate1RM(previousSet.weight, previousSet.reps);
          const improvement = ((current1RM - previous1RM) / previous1RM) * 100;

          return {
            hasPrevious: true,
            previous: {
              weight: previousSet.weight,
              reps: previousSet.reps,
              estimated1RM: previous1RM,
            },
            improvement,
            status:
              improvement > 2
                ? "improved"
                : improvement < -2
                ? "declined"
                : "maintained",
          };
        }
      }
    }

    return {
      hasPrevious: false,
      improvement: 0,
      status: "no_data" as const,
    };
  },
});

/**
 * Calculate progressive overload streak
 * How many consecutive sessions with improvement
 */
export const getProgressionStreak = query({
  args: {
    userId: v.id("users"),
    exerciseName: v.string(),
  },
  handler: async (ctx, args) => {
    const recentSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("completedAt"), undefined))
      .order("desc")
      .take(20);

    const sessionData = [];

    for (const session of recentSessions) {
      const sessionExercises = await ctx.db
        .query("sessionExercises")
        .withIndex("by_session_order", (q) => q.eq("sessionId", session._id))
        .collect();

      const matching = sessionExercises.filter(
        (se) =>
          se.exerciseName.toLowerCase() === args.exerciseName.toLowerCase()
      );

      for (const sessionExercise of matching) {
        const sets = await ctx.db
          .query("sets")
          .withIndex("by_session_exercise", (q) =>
            q.eq("sessionExerciseId", sessionExercise._id)
          )
          .filter((q) => q.eq(q.field("isWarmup"), false))
          .collect();

        if (sets.length > 0) {
          const avg1RM =
            sets.reduce((sum, s) => sum + calculate1RM(s.weight, s.reps), 0) /
            sets.length;
          sessionData.push({ date: session.completedAt!, avg1RM });
        }
      }
    }

    if (sessionData.length < 2) {
      return { streak: 0, totalSessions: sessionData.length };
    }

    // Calculate streak
    let streak = 0;
    for (let i = 0; i < sessionData.length - 1; i++) {
      if (sessionData[i].avg1RM > sessionData[i + 1].avg1RM) {
        streak++;
      } else {
        break;
      }
    }

    return {
      streak,
      totalSessions: sessionData.length,
      currentAvg1RM: Math.round(sessionData[0].avg1RM),
    };
  },
});

