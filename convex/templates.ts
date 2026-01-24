/**
 * Workout template mutations and queries
 * Handles template CRUD and exercise management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new workout template
 */
export const createTemplate = mutation({
  args: {
    userId: v.id("users"),
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
  },
  handler: async (ctx, args) => {
    const templateId = await ctx.db.insert("workoutTemplates", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      category: args.category,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return templateId;
  },
});

/**
 * Get all active templates for a user
 */
export const getUserTemplates = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();
  },
});

/**
 * Get template with exercises
 */
export const getTemplateWithExercises = query({
  args: {
    templateId: v.id("workoutTemplates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) return null;

    const exercises = await ctx.db
      .query("templateExercises")
      .withIndex("by_template_order", (q) =>
        q.eq("templateId", args.templateId)
      )
      .collect();

    return {
      ...template,
      exercises,
    };
  },
});

/**
 * Add exercise to template
 */
export const addExerciseToTemplate = mutation({
  args: {
    templateId: v.id("workoutTemplates"),
    exerciseName: v.string(),
    standardizedExerciseId: v.optional(v.id("exerciseLibrary")),
    orderIndex: v.number(),
    targetSets: v.optional(v.number()),
    targetRepsMin: v.optional(v.number()),
    targetRepsMax: v.optional(v.number()),
    restSeconds: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { templateId, ...exerciseData } = args;

    const exerciseId = await ctx.db.insert("templateExercises", {
      templateId,
      ...exerciseData,
      createdAt: Date.now(),
    });

    // Update template's updatedAt
    await ctx.db.patch(templateId, {
      updatedAt: Date.now(),
    });

    return exerciseId;
  },
});

/**
 * Update exercise in template
 */
export const updateTemplateExercise = mutation({
  args: {
    exerciseId: v.id("templateExercises"),
    exerciseName: v.optional(v.string()),
    standardizedExerciseId: v.optional(v.id("exerciseLibrary")),
    targetSets: v.optional(v.number()),
    targetRepsMin: v.optional(v.number()),
    targetRepsMax: v.optional(v.number()),
    restSeconds: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { exerciseId, ...updates } = args;

    await ctx.db.patch(exerciseId, updates);

    return exerciseId;
  },
});

/**
 * Remove exercise from template
 */
export const removeExerciseFromTemplate = mutation({
  args: {
    exerciseId: v.id("templateExercises"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.exerciseId);
  },
});

/**
 * Reorder exercises in template
 */
export const reorderTemplateExercises = mutation({
  args: {
    exerciseIds: v.array(v.id("templateExercises")),
  },
  handler: async (ctx, args) => {
    // Update orderIndex for each exercise
    await Promise.all(
      args.exerciseIds.map((exerciseId, index) =>
        ctx.db.patch(exerciseId, { orderIndex: index })
      )
    );
  },
});

/**
 * Delete template (soft delete)
 */
export const deleteTemplate = mutation({
  args: {
    templateId: v.id("workoutTemplates"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.templateId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Duplicate a template with all its exercises
 */
export const duplicateTemplate = mutation({
  args: {
    templateId: v.id("workoutTemplates"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get original template
    const original = await ctx.db.get(args.templateId);
    if (!original) throw new Error("Template not found");
    
    // Create new template
    const newTemplateId = await ctx.db.insert("workoutTemplates", {
      userId: args.userId,
      name: `${original.name} (Copy)`,
      description: original.description,
      category: original.category,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Get original exercises
    const originalExercises = await ctx.db
      .query("templateExercises")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();
    
    // Copy exercises
    for (const exercise of originalExercises) {
      await ctx.db.insert("templateExercises", {
        templateId: newTemplateId,
        exerciseName: exercise.exerciseName,
        standardizedExerciseId: exercise.standardizedExerciseId,
        orderIndex: exercise.orderIndex,
        targetSets: exercise.targetSets,
        targetRepsMin: exercise.targetRepsMin,
        targetRepsMax: exercise.targetRepsMax,
        targetWeight: exercise.targetWeight,
        targetWeightPercent1RM: exercise.targetWeightPercent1RM,
        restSeconds: exercise.restSeconds,
        targetRPE: exercise.targetRPE,
        targetRIR: exercise.targetRIR,
        notes: exercise.notes,
        createdAt: Date.now(),
      });
    }
    
    return newTemplateId;
  },
});
