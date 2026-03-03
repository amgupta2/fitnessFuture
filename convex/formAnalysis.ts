/**
 * Form analysis mutations and queries
 * Persist and retrieve AI form-check results.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveFormAnalysis = mutation({
  args: {
    userId: v.id("users"),
    exerciseName: v.string(),
    analysis: v.string(),
    formScore: v.optional(v.number()),
    issuesFound: v.optional(v.array(v.string())),
    videoFileName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("formAnalyses", {
      userId: args.userId,
      exerciseName: args.exerciseName,
      analysis: args.analysis,
      formScore: args.formScore,
      issuesFound: args.issuesFound,
      videoFileName: args.videoFileName,
      createdAt: Date.now(),
    });
  },
});

export const getFormAnalyses = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("formAnalyses")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const getFormAnalysesByExercise = query({
  args: {
    userId: v.id("users"),
    exerciseName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("formAnalyses")
      .withIndex("by_user_exercise", (q) =>
        q.eq("userId", args.userId).eq("exerciseName", args.exerciseName)
      )
      .order("desc")
      .take(limit);
  },
});
