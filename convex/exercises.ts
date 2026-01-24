/**
 * Exercise library management
 * Handles standardized exercises from Kaggle dataset
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import exercisesData from "./data/exercises.json";

/**
 * Seed the exercise library with Kaggle dataset
 * Run this once to populate the exerciseLibrary table
 */
export const seedExercises = internalMutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("exerciseLibrary").first();
    if (existing) {
      throw new Error("Exercise library already seeded. Clear the table first if you want to reseed.");
    }

    let imported = 0;
    for (const exercise of exercisesData) {
      try {
        // Skip if missing essential data
        if (!exercise.Exercise_Name || !exercise.muscle_gp) {
          console.log(`Skipping exercise with missing data:`, exercise);
          continue;
        }

        await ctx.db.insert("exerciseLibrary", {
          name: exercise.Exercise_Name,
          aliases: generateAliases(exercise.Exercise_Name),
          category: normalizeCategory(exercise.muscle_gp || "other"),
          movementPattern: inferMovementPattern(exercise.Exercise_Name, exercise.muscle_gp || ""),
          muscleGroups: [exercise.muscle_gp],
          equipmentType: normalizeEquipment(exercise.Equipment || "other"),
          is1RMTracked: shouldTrack1RM(exercise.Exercise_Name, exercise.Equipment || ""),
          imageUrl: exercise.Exercise_Image || undefined,
          videoUrl: exercise.Description_URL || undefined,
          createdAt: Date.now(),
        });
        imported++;
      } catch (error) {
        console.error(`Failed to import ${exercise.Exercise_Name}:`, error);
      }
    }

    return { imported, total: exercisesData.length };
  },
});

/**
 * Search exercises by name
 */
export const searchExercises = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchTerm = args.query.toLowerCase().trim();

    if (!searchTerm) {
      // Return first exercises if no search term
      return await ctx.db
        .query("exerciseLibrary")
        .order("desc")
        .take(limit);
    }

    // Search by name (case-insensitive)
    const allExercises = await ctx.db.query("exerciseLibrary").collect();
    
    const matches = allExercises
      .filter((ex) => 
        ex.name.toLowerCase().includes(searchTerm) ||
        ex.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm)) ||
        ex.aliases.some(alias => alias.includes(searchTerm))
      )
      .slice(0, limit);

    return matches;
  },
});

/**
 * Get exercise by ID
 */
export const getExercise = query({
  args: { exerciseId: v.id("exerciseLibrary") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.exerciseId);
  },
});

/**
 * Get exercises by muscle group
 */
export const getExercisesByMuscleGroup = query({
  args: { 
    muscleGroup: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const allExercises = await ctx.db.query("exerciseLibrary").collect();
    
    return allExercises
      .filter((ex) => 
        ex.muscleGroups.some(mg => 
          mg.toLowerCase() === args.muscleGroup.toLowerCase()
        )
      )
      .slice(0, limit);
  },
});

/**
 * Get popular/recommended exercises
 */
export const getPopularExercises = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get compound exercises first as they're typically more popular
    const allExercises = await ctx.db.query("exerciseLibrary").collect();
    
    // Prioritize compound movements and well-known exercises
    const sorted = allExercises.sort((a, b) => {
      // Compound exercises first
      if (a.category === "compound" && b.category !== "compound") return -1;
      if (b.category === "compound" && a.category !== "compound") return 1;
      
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
    
    return sorted.slice(0, limit);
  },
});

// Helper functions

function normalizeCategory(muscleGroup: string): "compound" | "isolation" {
  const muscleGroupLower = muscleGroup.toLowerCase();
  
  // Exercises for these muscle groups are typically compound
  const compoundGroups = ["quadriceps", "hamstrings", "glutes", "middle back", "lats", "lower back"];
  
  if (compoundGroups.some(group => muscleGroupLower.includes(group))) {
    return "compound";
  }
  
  return "isolation";
}

function normalizeEquipment(equipment: string): "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "other" {
  const equipmentMap: Record<string, "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "other"> = {
    "barbell": "barbell",
    "dumbbell": "dumbbell",
    "machine": "machine",
    "cable": "cable",
    "body only": "bodyweight",
    "bodyweight": "bodyweight",
    "other": "other",
  };

  const normalized = equipment.toLowerCase();
  return equipmentMap[normalized] || "other";
}

function inferMovementPattern(
  exerciseName: string, 
  muscleGroup: string
): "horizontal_push" | "vertical_push" | "horizontal_pull" | "vertical_pull" | "squat" | "hinge" | "lunge" | "carry" | "other" {
  const nameLower = exerciseName.toLowerCase();
  const muscleLower = muscleGroup.toLowerCase();
  
  // Push patterns
  if (nameLower.includes("bench") || nameLower.includes("push-up") || nameLower.includes("pushup")) {
    return "horizontal_push";
  }
  if (nameLower.includes("overhead") || nameLower.includes("military press") || 
      nameLower.includes("shoulder press") || (nameLower.includes("press") && muscleLower.includes("shoulders"))) {
    return "vertical_push";
  }
  
  // Pull patterns
  if (nameLower.includes("row") || (nameLower.includes("pull") && !nameLower.includes("pull-up") && !nameLower.includes("pullup"))) {
    return "horizontal_pull";
  }
  if (nameLower.includes("pull-up") || nameLower.includes("pullup") || 
      nameLower.includes("lat pulldown") || nameLower.includes("pulldown")) {
    return "vertical_pull";
  }
  
  // Leg patterns
  if (nameLower.includes("squat")) {
    return "squat";
  }
  if (nameLower.includes("deadlift") || nameLower.includes("rdl") || 
      nameLower.includes("good morning") || nameLower.includes("hip hinge")) {
    return "hinge";
  }
  if (nameLower.includes("lunge") || nameLower.includes("split squat") || nameLower.includes("step-up")) {
    return "lunge";
  }
  
  // Carry patterns
  if (nameLower.includes("carry") || nameLower.includes("walk") || nameLower.includes("farmer")) {
    return "carry";
  }
  
  return "other";
}

function shouldTrack1RM(exerciseName: string, equipment: string): boolean {
  const nameLower = exerciseName.toLowerCase();
  
  // Don't track 1RM for cardio, isolation, or bodyweight-only exercises
  if (nameLower.includes("cardio") || nameLower.includes("run") || 
      nameLower.includes("bike") || nameLower.includes("elliptical") ||
      nameLower.includes("treadmill") || nameLower.includes("rower") ||
      nameLower.includes("stairmaster")) {
    return false;
  }
  
  // Don't track 1RM for most bodyweight exercises
  if (equipment.toLowerCase() === "body only" && 
      !nameLower.includes("weighted") && !nameLower.includes("dip")) {
    return false;
  }
  
  // Track 1RM for compound movements
  if (nameLower.includes("squat") || nameLower.includes("deadlift") || 
      nameLower.includes("bench") || nameLower.includes("press") ||
      nameLower.includes("row")) {
    return true;
  }
  
  return false;
}

function generateAliases(exerciseName: string): string[] {
  const aliases: string[] = [];
  const name = exerciseName.toLowerCase();
  
  // Add full name as first alias
  aliases.push(name);
  
  // Add common abbreviations
  if (name.includes("dumbbell")) {
    aliases.push(name.replace("dumbbell", "db"));
  }
  if (name.includes("barbell")) {
    aliases.push(name.replace("barbell", "bb"));
  }
  if (name.includes("bench press")) {
    aliases.push(name.replace("bench press", "bp"));
  }
  if (name.includes("deadlift")) {
    aliases.push(name.replace("deadlift", "dl"));
    aliases.push("dl");
  }
  if (name.includes("squat")) {
    aliases.push("squat");
  }
  
  // Remove duplicates and filter out very short aliases
  return [...new Set(aliases)].filter(alias => alias.length >= 2);
}

