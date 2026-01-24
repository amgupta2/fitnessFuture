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
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
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
 * Helper function to get base user context
 */
async function getBaseUserContext(ctx: any, userId: any) {
  // Get user
  const user = await ctx.db.get(userId);
  if (!user) return null;

  // Get current templates
  const templates = await ctx.db
    .query("workoutTemplates")
    .withIndex("by_user_active", (q) =>
      q.eq("userId", userId).eq("isActive", true)
    )
    .take(10);

  // Get exercises for each template
  const templatesWithExercises = await Promise.all(
    templates.map(async (template) => {
      const exercises = await ctx.db
        .query("templateExercises")
        .withIndex("by_template_order", (q) =>
          q.eq("templateId", template._id)
        )
        .collect();

      return {
        name: template.name,
        exercises: exercises.map((e) => e.exerciseName),
      };
    })
  );

  // Get recent workouts (last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentWorkouts = await ctx.db
    .query("workoutSessions")
    .withIndex("by_user_completed", (q) => q.eq("userId", userId))
    .filter((q) =>
      q.and(
        q.neq(q.field("completedAt"), undefined),
        q.gte(q.field("completedAt"), thirtyDaysAgo)
      )
    )
    .collect();

  return {
    experienceLevel: user.experienceLevel,
    currentTemplates: templatesWithExercises,
    recentWorkouts: recentWorkouts.map((w) => ({
      templateName: w.templateName,
      completedAt: w.completedAt || 0,
    })),
  };
}

/**
 * Get enhanced training context for AI trainer mode
 * Includes workout history, recent performance, and exercise statistics
 */
export const getTrainingContextForAI = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get base context using helper
    const baseContext = await getBaseUserContext(ctx, args.userId);
    if (!baseContext) return null;

    // Get recent completed sessions (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.neq(q.field("completedAt"), undefined),
          q.gte(q.field("completedAt"), thirtyDaysAgo)
        )
      )
      .collect();

    // Get exercise-level statistics
    const exerciseStats = new Map<string, {
      name: string;
      sets: number[];
      weights: number[];
      reps: number[];
      lastPerformed: number;
    }>();

    for (const session of recentSessions) {
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
          .filter((q) => q.eq(q.field("isWarmup"), false)) // Exclude warmups
          .collect();

        const exerciseName = sessionExercise.exerciseName;
        
        if (!exerciseStats.has(exerciseName)) {
          exerciseStats.set(exerciseName, {
            name: exerciseName,
            sets: [],
            weights: [],
            reps: [],
            lastPerformed: session.completedAt || 0,
          });
        }

        const stats = exerciseStats.get(exerciseName)!;
        stats.sets.push(sets.length);
        stats.weights.push(...sets.map((s) => s.weight));
        stats.reps.push(...sets.map((s) => s.reps));
        stats.lastPerformed = Math.max(stats.lastPerformed, session.completedAt || 0);
      }
    }

    // Aggregate exercise statistics
    const recentExercises = Array.from(exerciseStats.values())
      .map((stats) => ({
        name: stats.name,
        sets: Math.round(
          stats.sets.reduce((a, b) => a + b, 0) / stats.sets.length
        ),
        avgWeight: Math.round(
          stats.weights.reduce((a, b) => a + b, 0) / stats.weights.length
        ),
        avgReps: Math.round(
          stats.reps.reduce((a, b) => a + b, 0) / stats.reps.length
        ),
        lastPerformed: stats.lastPerformed,
      }))
      .sort((a, b) => b.lastPerformed - a.lastPerformed) // Most recent first
      .slice(0, 10); // Top 10 exercises

    // Calculate total volume
    const totalVolume = recentSessions.reduce(
      (sum, session) => sum + (session.totalVolume || 0),
      0
    );

    // Calculate training frequency
    const trainingFrequency = recentSessions.length / 4; // Sessions per week (over 4 weeks)

    return {
      ...baseContext,
      recentExercises,
      totalVolume,
      trainingFrequency: Math.round(trainingFrequency * 10) / 10, // 1 decimal place
    };
  },
});
