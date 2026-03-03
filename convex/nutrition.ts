/**
 * Nutrition tracking mutations and queries.
 * Manages daily targets and meal logs.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Nutrition Targets ──────────────────────────────────────────────────────

export const setNutritionTargets = mutation({
  args: {
    userId: v.id("users"),
    dailyCalories: v.number(),
    proteinGrams: v.number(),
    carbsGrams: v.number(),
    fatGrams: v.number(),
    method: v.union(v.literal("ai_suggested"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("nutritionTargets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        dailyCalories: args.dailyCalories,
        proteinGrams: args.proteinGrams,
        carbsGrams: args.carbsGrams,
        fatGrams: args.fatGrams,
        method: args.method,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("nutritionTargets", {
      userId: args.userId,
      dailyCalories: args.dailyCalories,
      proteinGrams: args.proteinGrams,
      carbsGrams: args.carbsGrams,
      fatGrams: args.fatGrams,
      method: args.method,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getNutritionTargets = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nutritionTargets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// ── Meal Logs ──────────────────────────────────────────────────────────────

const mealItemValidator = v.object({
  name: v.string(),
  quantity: v.optional(v.string()),
  calories: v.number(),
  proteinGrams: v.number(),
  carbsGrams: v.number(),
  fatGrams: v.number(),
});

export const logMeal = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
    items: v.array(mealItemValidator),
    totalCalories: v.number(),
    totalProtein: v.number(),
    totalCarbs: v.number(),
    totalFat: v.number(),
    source: v.union(
      v.literal("photo"),
      v.literal("text"),
      v.literal("manual")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mealLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getMealsByDate = query({
  args: {
    userId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mealLogs")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();
  },
});

export const deleteMealLog = mutation({
  args: { id: v.id("mealLogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateMealLog = mutation({
  args: {
    id: v.id("mealLogs"),
    items: v.array(mealItemValidator),
    totalCalories: v.number(),
    totalProtein: v.number(),
    totalCarbs: v.number(),
    totalFat: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      items: args.items,
      totalCalories: args.totalCalories,
      totalProtein: args.totalProtein,
      totalCarbs: args.totalCarbs,
      totalFat: args.totalFat,
    });
  },
});

export const getWeeklyNutritionSummary = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date();
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const summary: Array<{
      date: string;
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      mealCount: number;
    }> = [];

    for (const date of dates) {
      const meals = await ctx.db
        .query("mealLogs")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", args.userId).eq("date", date)
        )
        .collect();

      summary.push({
        date,
        totalCalories: meals.reduce((s, m) => s + m.totalCalories, 0),
        totalProtein: meals.reduce((s, m) => s + m.totalProtein, 0),
        totalCarbs: meals.reduce((s, m) => s + m.totalCarbs, 0),
        totalFat: meals.reduce((s, m) => s + m.totalFat, 0),
        mealCount: meals.length,
      });
    }

    return summary;
  },
});
