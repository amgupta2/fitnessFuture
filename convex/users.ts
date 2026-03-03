/**
 * User management queries and mutations
 * Handles user creation, lookup, and profile updates
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ExperienceLevel, WeightUnit } from "./types";

/**
 * Get or create user by WorkOS ID
 * Called during authentication flow
 */
export const getOrCreateUser = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user with defaults
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      workosId: args.workosId,
      email: args.email,
      name: args.name,
      experienceLevel: "beginner", // Default, updated during onboarding
      preferences: {
        weightUnit: "lbs",
        defaultRestSeconds: 120,
        darkMode: true,
      },
      createdAt: now,
      updatedAt: 0, // Set to 0 to indicate onboarding not completed
    });

    return await ctx.db.get(userId);
  },
});

/**
 * Get user by WorkOS ID
 * Primary lookup for authenticated requests
 */
export const getUserByWorkosId = query({
  args: {
    workosId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();
  },
});

/**
 * Get current user
 * Uses Convex auth context
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
      .first();
  },
});

/**
 * Update user profile
 * Used during onboarding and settings changes
 */
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    experienceLevel: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    preferences: v.optional(
      v.object({
        weightUnit: v.union(v.literal("kg"), v.literal("lbs")),
        defaultRestSeconds: v.number(),
        darkMode: v.boolean(),
      })
    ),
    primaryGoal: v.optional(v.union(
      v.literal("strength"),
      v.literal("hypertrophy"),
      v.literal("endurance"),
      v.literal("weight_loss"),
      v.literal("general_fitness"),
      v.literal("sport_performance")
    )),
    targetMuscleGroups: v.optional(v.array(v.string())),
    availableEquipment: v.optional(v.array(v.union(
      v.literal("barbell"),
      v.literal("dumbbell"),
      v.literal("machine"),
      v.literal("cable"),
      v.literal("bodyweight"),
      v.literal("bands"),
      v.literal("kettlebell"),
      v.literal("other")
    ))),
    trainingDaysPerWeek: v.optional(v.number()),
    sessionDurationMinutes: v.optional(v.number()),
    age: v.optional(v.number()),
    bodyWeight: v.optional(v.number()),
    height: v.optional(v.number()),
    gender: v.optional(v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("prefer_not_to_say")
    )),
    injuries: v.optional(v.array(v.string())),
    sleepQuality: v.optional(v.union(
      v.literal("poor"),
      v.literal("average"),
      v.literal("good")
    )),
    stressLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("moderate"),
      v.literal("high")
    )),
    occupationType: v.optional(v.union(
      v.literal("sedentary"),
      v.literal("lightly_active"),
      v.literal("physically_demanding")
    )),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

/**
 * Complete user onboarding
 * Sets experience level, preferences, and new profile fields
 */
export const completeOnboarding = mutation({
  args: {
    workosId: v.string(),
    experienceLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    weightUnit: v.union(v.literal("kg"), v.literal("lbs")),
    name: v.optional(v.string()),
    primaryGoal: v.optional(v.union(
      v.literal("strength"),
      v.literal("hypertrophy"),
      v.literal("endurance"),
      v.literal("weight_loss"),
      v.literal("general_fitness"),
      v.literal("sport_performance")
    )),
    targetMuscleGroups: v.optional(v.array(v.string())),
    availableEquipment: v.optional(v.array(v.union(
      v.literal("barbell"),
      v.literal("dumbbell"),
      v.literal("machine"),
      v.literal("cable"),
      v.literal("bodyweight"),
      v.literal("bands"),
      v.literal("kettlebell"),
      v.literal("other")
    ))),
    trainingDaysPerWeek: v.optional(v.number()),
    sessionDurationMinutes: v.optional(v.number()),
    age: v.optional(v.number()),
    bodyWeight: v.optional(v.number()),
    height: v.optional(v.number()),
    gender: v.optional(v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("prefer_not_to_say")
    )),
    injuries: v.optional(v.array(v.string())),
    sleepQuality: v.optional(v.union(
      v.literal("poor"),
      v.literal("average"),
      v.literal("good")
    )),
    stressLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("moderate"),
      v.literal("high")
    )),
    occupationType: v.optional(v.union(
      v.literal("sedentary"),
      v.literal("lightly_active"),
      v.literal("physically_demanding")
    )),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const { workosId, weightUnit, ...rest } = args;

    await ctx.db.patch(user._id, {
      ...rest,
      preferences: {
        ...user.preferences,
        weightUnit,
      },
      updatedAt: Date.now(),
    });

    return await ctx.db.get(user._id);
  },
});

/**
 * Check if user has completed onboarding
 * Used to redirect new users to onboarding flow
 */
export const hasCompletedOnboarding = query({
  args: {
    workosId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    if (!user) {
      return false;
    }

    // User is considered onboarded if updatedAt is set (> 0)
    // New users have updatedAt = 0 until they complete onboarding
    return user.updatedAt > 0;
  },
});
