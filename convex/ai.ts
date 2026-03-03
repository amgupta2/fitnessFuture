/**
 * AI interactions and workout template generation
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Save AI interaction to database
 */
export const saveInteraction = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("programmer"),
      v.literal("trainer"),
      v.literal("general")
    ),
    prompt: v.string(),
    response: v.string(),
    contextData: v.optional(
      v.object({
        templateIds: v.optional(v.array(v.id("workoutTemplates"))),
        sessionIds: v.optional(v.array(v.id("workoutSessions"))),
        recentVolume: v.optional(v.number()),
        experienceLevel: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const interactionId = await ctx.db.insert("aiInteractions", {
      userId: args.userId,
      type: args.type,
      prompt: args.prompt,
      response: args.response,
      contextData: args.contextData,
      createdAt: Date.now(),
    });

    return interactionId;
  },
});

/**
 * Get AI conversation history for a user
 */
export const getConversationHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    return await ctx.db
    .query("aiInteractions")
    .withIndex("by_user_created", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Create workout templates from AI-generated data
 */
export const createTemplatesFromAI = mutation({
  args: {
    userId: v.id("users"),
    templates: v.array(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        category: v.optional(
          v.union(
            v.literal("push"),
            v.literal("pull"),
            v.literal("legs"),
            v.literal("upper"),
            v.literal("lower"),
            v.literal("full_body"),
            v.literal("custom")
          )
        ),
        exercises: v.array(
          v.object({
            name: v.string(),
            sets: v.number(),
            repsMin: v.number(),
            repsMax: v.number(),
            restSeconds: v.number(),
            notes: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const createdTemplateIds: string[] = [];

    for (const template of args.templates) {
      // Create template
      const templateId = await ctx.db.insert("workoutTemplates", {
        userId: args.userId,
        name: template.name,
        description: template.description,
        category: template.category,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Find standardized exercises for each AI-generated exercise
      for (let i = 0; i < template.exercises.length; i++) {
        const exercise = template.exercises[i];

        // Try to match exercise name to standardized library
        const standardizedExercise = await findStandardizedExercise(
          ctx,
          exercise.name
        );

        await ctx.db.insert("templateExercises", {
          templateId,
          exerciseName: exercise.name,
          standardizedExerciseId: standardizedExercise?._id,
          orderIndex: i,
          targetSets: exercise.sets,
          targetRepsMin: exercise.repsMin,
          targetRepsMax: exercise.repsMax,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
          createdAt: Date.now(),
        });
      }

      createdTemplateIds.push(templateId);
    }

    return createdTemplateIds;
  },
});

/**
 * Helper: Find standardized exercise by fuzzy name matching
 */
async function findStandardizedExercise(ctx: any, exerciseName: string) {
  const normalizedName = exerciseName.toLowerCase().trim();

  // Get all exercises and do matching in memory
  // (Convex doesn't support .toLowerCase() in filters)
  const allExercises = await ctx.db.query("exerciseLibrary").collect();

  // Try exact match first
  for (const exercise of allExercises) {
    if (exercise.name.toLowerCase() === normalizedName) {
      return exercise;
    }
  }

  // Try alias match
  for (const exercise of allExercises) {
    const aliasMatch = exercise.aliases.some(
      (alias: string) => alias.toLowerCase() === normalizedName
    );
    if (aliasMatch) return exercise;
  }

  // Try fuzzy match (contains)
  for (const exercise of allExercises) {
    if (exercise.name.toLowerCase().includes(normalizedName)) {
      return exercise;
    }
  }

  return null;
}

/**
 * Get user context for AI (templates, recent workouts, experience)
 */
export const getUserContextForAI = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await getBaseUserContext(ctx, args.userId);
  },
});

/**
 * Build the single unified rich context used by ALL AI modes.
 * Includes: full user profile, programming details (sets/reps/rest),
 * exercise performance history, estimated 1RMs from PRs, and volume metrics.
 */
async function getBaseUserContext(ctx: any, userId: any) {
  const user = await ctx.db.get(userId);
  if (!user) return null;

  // ── Current templates with full exercise parameters ──────────────────────
  // Cap at 5 templates — keeps prompt under ~600 tokens for this section
  const templates = await ctx.db
    .query("workoutTemplates")
    .withIndex("by_user_active", (q: any) =>
      q.eq("userId", userId).eq("isActive", true)
    )
    .take(5);

  const templatesWithExercises = await Promise.all(
    templates.map(async (template: any) => {
      const exercises = await ctx.db
        .query("templateExercises")
        .withIndex("by_template_order", (q: any) =>
          q.eq("templateId", template._id)
        )
        .collect();

      // Cap at 6 exercises per template (~20 tokens each)
      return {
        name: template.name,
        exercises: exercises.slice(0, 6).map((e: any) => ({
          name: e.exerciseName,
          sets: e.targetSets,
          repsMin: e.targetRepsMin,
          repsMax: e.targetRepsMax,
          rest: e.restSeconds,
          notes: e.notes,
        })),
      };
    })
  );

  // ── Recent sessions (single query used for all downstream aggregations) ───
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentSessions = await ctx.db
    .query("workoutSessions")
    .withIndex("by_user_completed", (q: any) => q.eq("userId", userId))
    .filter((q: any) =>
      q.and(
        q.neq(q.field("completedAt"), undefined),
        q.gte(q.field("completedAt"), thirtyDaysAgo)
      )
    )
    .collect();

  // ── Aggregate per-exercise stats from the session log ────────────────────
  const exerciseStats = new Map<string, {
    sets: number[];
    weights: number[];
    reps: number[];
    lastPerformed: number;
  }>();

  for (const session of recentSessions) {
    const sessionExercises = await ctx.db
      .query("sessionExercises")
      .withIndex("by_session_order", (q: any) => q.eq("sessionId", session._id))
      .collect();

    for (const se of sessionExercises) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("by_session_exercise", (q: any) =>
          q.eq("sessionExerciseId", se._id)
        )
        .filter((q: any) => q.eq(q.field("isWarmup"), false))
        .collect();

      if (sets.length === 0) continue;

      const name = se.exerciseName;
      if (!exerciseStats.has(name)) {
        exerciseStats.set(name, {
          sets: [],
          weights: [],
          reps: [],
          lastPerformed: session.completedAt || 0,
        });
      }
      const stat = exerciseStats.get(name)!;
      stat.sets.push(sets.length);
      stat.weights.push(...sets.map((s: any) => s.weight));
      stat.reps.push(...sets.map((s: any) => s.reps));
      stat.lastPerformed = Math.max(stat.lastPerformed, session.completedAt || 0);
    }
  }

  const recentExercises = Array.from(exerciseStats.entries())
    .map(([name, stat]) => ({
      name,
      sets: Math.round(stat.sets.reduce((a, b) => a + b, 0) / stat.sets.length),
      avgWeight: Math.round(stat.weights.reduce((a, b) => a + b, 0) / stat.weights.length),
      avgReps: Math.round(stat.reps.reduce((a, b) => a + b, 0) / stat.reps.length),
      lastPerformed: stat.lastPerformed,
    }))
    .sort((a, b) => b.lastPerformed - a.lastPerformed)
    .slice(0, 7); // cap at 7 — ~15 tokens each

  const totalVolume = recentSessions.reduce(
    (sum: number, s: any) => sum + (s.totalVolume || 0),
    0
  );
  const trainingFrequency = Math.round((recentSessions.length / 4) * 10) / 10;

  // ── Personal Records — current estimated 1RMs ─────────────────────────────
  const currentPRs = await ctx.db
    .query("personalRecords")
    .withIndex("by_user_current", (q: any) =>
      q.eq("userId", userId).eq("isCurrent", true)
    )
    .filter((q: any) => q.eq(q.field("recordType"), "estimated_1rm"))
    .collect();

  const personalRecords = currentPRs
    .sort((a: any, b: any) => b.achievedAt - a.achievedAt)
    .slice(0, 7) // cap at 7 — covers main compound lifts
    .map((pr: any) => ({
      exerciseName: pr.exerciseName,
      estimated1RM: Math.round(pr.value),
    }));

  return {
    // Profile
    weightUnit: user.preferences.weightUnit as "kg" | "lbs",
    experienceLevel: user.experienceLevel,
    primaryGoal: user.primaryGoal,
    targetMuscleGroups: user.targetMuscleGroups,
    availableEquipment: user.availableEquipment,
    trainingDaysPerWeek: user.trainingDaysPerWeek,
    sessionDurationMinutes: user.sessionDurationMinutes,
    age: user.age,
    bodyWeight: user.bodyWeight,
    injuries: user.injuries,
    sleepQuality: user.sleepQuality,
    stressLevel: user.stressLevel,
    occupationType: user.occupationType,
    // Programming
    currentTemplates: templatesWithExercises,
    // History summary
    recentWorkouts: recentSessions.map((w: any) => ({
      templateName: w.templateName,
      completedAt: w.completedAt || 0,
    })),
    // Performance analytics
    recentExercises,
    totalVolume: Math.round(totalVolume),
    trainingFrequency,
    // Strength levels
    personalRecords,
  };
}

/**
 * Get full training context for AI trainer mode.
 * Now delegates entirely to getBaseUserContext which includes all analytics.
 */
export const getTrainingContextForAI = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await getBaseUserContext(ctx, args.userId);
  },
});
