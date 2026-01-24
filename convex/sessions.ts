/**
 * Workout session mutations and queries
 * Handles active sessions, set logging, and history
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Start a new workout session from template
 */
export const startSession = mutation({
  args: {
    userId: v.id("users"),
    templateId: v.optional(v.id("workoutTemplates")),
    templateName: v.string(),
  },
  handler: async (ctx, args) => {
    // Create session
    const sessionId = await ctx.db.insert("workoutSessions", {
      userId: args.userId,
      templateId: args.templateId,
      templateName: args.templateName,
      startedAt: Date.now(),
      createdAt: Date.now(),
    });

    // If template provided, copy exercises to session
    if (args.templateId) {
      const templateExercises = await ctx.db
        .query("templateExercises")
        .withIndex("by_template_order", (q) =>
          q.eq("templateId", args.templateId!)
        )
        .collect();

      await Promise.all(
        templateExercises.map((exercise) =>
          ctx.db.insert("sessionExercises", {
            sessionId,
            templateExerciseId: exercise._id,
            exerciseName: exercise.exerciseName,
            standardizedExerciseId: exercise.standardizedExerciseId,
            orderIndex: exercise.orderIndex,
            createdAt: Date.now(),
          })
        )
      );
    }

    return sessionId;
  },
});

/**
 * Get active session for user
 */
export const getActiveSession = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_started", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completedAt"), undefined))
      .first();

    if (!session) return null;

    const exercises = await ctx.db
      .query("sessionExercises")
      .withIndex("by_session_order", (q) => q.eq("sessionId", session._id))
      .collect();

    const exercisesWithSets = await Promise.all(
      exercises.map(async (exercise) => {
        const sets = await ctx.db
          .query("sets")
          .withIndex("by_session_exercise", (q) =>
            q.eq("sessionExerciseId", exercise._id)
          )
          .collect();

        // Get template exercise data if available
        let templateExercise = null;
        if (exercise.templateExerciseId) {
          templateExercise = await ctx.db.get(exercise.templateExerciseId);
        }

        return {
          ...exercise,
          sets,
          // Include template targets for UI
          targetSets: templateExercise?.targetSets,
          targetRepsMin: templateExercise?.targetRepsMin,
          targetRepsMax: templateExercise?.targetRepsMax,
          restSeconds: templateExercise?.restSeconds,
        };
      })
    );

    return {
      ...session,
      exercises: exercisesWithSets,
    };
  },
});

/**
 * Add exercise to active session
 */
export const addExerciseToSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
    exerciseName: v.string(),
    orderIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const exerciseId = await ctx.db.insert("sessionExercises", {
      sessionId: args.sessionId,
      exerciseName: args.exerciseName,
      orderIndex: args.orderIndex,
      createdAt: Date.now(),
    });

    return exerciseId;
  },
});

/**
 * Log a set
 */
export const logSet = mutation({
  args: {
    sessionExerciseId: v.id("sessionExercises"),
    setNumber: v.number(),
    weight: v.number(),
    reps: v.number(),
    rpe: v.optional(v.number()),
    rir: v.optional(v.number()),
    isWarmup: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sessionExerciseId, ...setData } = args;

    // Get session exercise to check for PRs
    const sessionExercise = await ctx.db.get(sessionExerciseId);
    if (!sessionExercise) throw new Error("Session exercise not found");

    // Calculate estimated 1RM (Epley formula)
    const estimated1RM =
      args.reps === 1
        ? args.weight
        : Math.round(args.weight * (1 + args.reps / 30));

    // Check if this is a PR
    let isPR = false;
    if (!args.isWarmup) {
      // Get session to find userId
      const session = await ctx.db.get(sessionExercise.sessionId);
      if (!session) throw new Error("Session not found");

      // Query for PRs - use standardizedExerciseId if available, otherwise match by name
      let currentPR;
      if (sessionExercise.standardizedExerciseId) {
        currentPR = await ctx.db
          .query("personalRecords")
          .withIndex("by_user_exercise_type", (q) =>
            q
              .eq("userId", session.userId)
              .eq("standardizedExerciseId", sessionExercise.standardizedExerciseId)
              .eq("recordType", "estimated_1rm")
          )
          .filter((q) => q.eq(q.field("isCurrent"), true))
          .first();
      } else {
        // Fall back to matching by exercise name (case-insensitive)
        const allUserPRs = await ctx.db
          .query("personalRecords")
          .withIndex("by_user", (q) => q.eq("userId", session.userId))
          .filter((q) => q.eq(q.field("isCurrent"), true))
          .filter((q) => q.eq(q.field("recordType"), "estimated_1rm"))
          .collect();
        
        currentPR = allUserPRs.find(
          (pr) => pr.exerciseName.toLowerCase() === sessionExercise.exerciseName.toLowerCase()
        );
      }

      isPR = !currentPR || estimated1RM > currentPR.value;
    }

    // Insert set
    const setId = await ctx.db.insert("sets", {
      sessionExerciseId,
      ...setData,
      isPR,
      completedAt: Date.now(),
    });

    // If PR, create PR record
    if (isPR) {
      const session = await ctx.db.get(sessionExercise.sessionId);
      if (session) {
        // Mark old PR as not current
        let oldPRs;
        if (sessionExercise.standardizedExerciseId) {
          oldPRs = await ctx.db
            .query("personalRecords")
            .withIndex("by_user_exercise_type", (q) =>
              q
                .eq("userId", session.userId)
                .eq(
                  "standardizedExerciseId",
                  sessionExercise.standardizedExerciseId!
                )
                .eq("recordType", "estimated_1rm")
            )
            .filter((q) => q.eq(q.field("isCurrent"), true))
            .collect();
        } else {
          // Fall back to matching by exercise name
          const allUserPRs = await ctx.db
            .query("personalRecords")
            .withIndex("by_user", (q) => q.eq("userId", session.userId))
            .filter((q) => q.eq(q.field("isCurrent"), true))
            .filter((q) => q.eq(q.field("recordType"), "estimated_1rm"))
            .collect();
          
          oldPRs = allUserPRs.filter(
            (pr) => pr.exerciseName.toLowerCase() === sessionExercise.exerciseName.toLowerCase()
          );
        }

        await Promise.all(
          oldPRs.map((pr) => ctx.db.patch(pr._id, { isCurrent: false }))
        );

        // Create new PR
        await ctx.db.insert("personalRecords", {
          userId: session.userId,
          standardizedExerciseId: sessionExercise.standardizedExerciseId,
          exerciseName: sessionExercise.exerciseName,
          recordType: "estimated_1rm",
          value: estimated1RM,
          sessionId: session._id,
          setId,
          achievedAt: Date.now(),
          isCurrent: true,
          createdAt: Date.now(),
        });
      }
    }

    return { setId, isPR };
  },
});

/**
 * Update a set
 */
export const updateSet = mutation({
  args: {
    setId: v.id("sets"),
    weight: v.optional(v.number()),
    reps: v.optional(v.number()),
    rpe: v.optional(v.number()),
    rir: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { setId, ...updates } = args;
    await ctx.db.patch(setId, updates);
    return setId;
  },
});

/**
 * Delete a set
 */
export const deleteSet = mutation({
  args: {
    setId: v.id("sets"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.setId);
  },
});

/**
 * Complete workout session
 */
export const completeSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Calculate totals
    const sessionExercises = await ctx.db
      .query("sessionExercises")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    for (const exercise of sessionExercises) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("by_session_exercise", (q) =>
          q.eq("sessionExerciseId", exercise._id)
        )
        .filter((q) => q.eq(q.field("isWarmup"), false))
        .collect();

      totalSets += sets.length;
      totalReps += sets.reduce((sum, set) => sum + set.reps, 0);
      totalVolume += sets.reduce(
        (sum, set) => sum + set.weight * set.reps,
        0
      );
    }

    const durationMinutes = Math.round(
      (Date.now() - session.startedAt) / 60000
    );

    await ctx.db.patch(args.sessionId, {
      completedAt: Date.now(),
      durationMinutes,
      totalVolume,
      totalSets,
      totalReps,
    });

    return args.sessionId;
  },
});

/**
 * Get workout history for user
 */
export const getWorkoutHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    return await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("completedAt"), undefined))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get session details with exercises and sets
 */
export const getSessionDetails = query({
  args: {
    sessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    const exercises = await ctx.db
      .query("sessionExercises")
      .withIndex("by_session_order", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const exercisesWithSets = await Promise.all(
      exercises.map(async (exercise) => {
        const sets = await ctx.db
          .query("sets")
          .withIndex("by_session_exercise", (q) =>
            q.eq("sessionExerciseId", exercise._id)
          )
          .collect();

        return {
          ...exercise,
          sets,
        };
      })
    );

    return {
      ...session,
      exercises: exercisesWithSets,
    };
  },
});
