import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * NEXT-GEN FITNESS PLATFORM - CONVEX SCHEMA
 *
 * Core Design Principles:
 * 1. User isolation: All user-owned data includes userId for strict access control
 * 2. Historical tracking: Immutable workout logs with full session snapshots
 * 3. Analytics-first: Indexes and denormalization for fast time-series queries
 * 4. AI-ready: Structured data for context injection into Gemini prompts
 * 5. Extensibility: Flexible schema supporting future features (supersets, circuits, etc.)
 */

export default defineSchema({
  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Users - Core user profiles
   * Linked to WorkOS userId for authentication
   */
  users: defineTable({
    workosId: v.string(),        // WorkOS user ID (primary external key)
    email: v.string(),
    name: v.optional(v.string()),

    // Training profile
    experienceLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),

    // Fitness goals
    primaryGoal: v.optional(v.union(
      v.literal("strength"),
      v.literal("hypertrophy"),
      v.literal("endurance"),
      v.literal("weight_loss"),
      v.literal("general_fitness"),
      v.literal("sport_performance")
    )),

    // Muscle focus from body diagram
    targetMuscleGroups: v.optional(v.array(v.string())),

    // Available equipment (multi-select)
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

    // Schedule
    trainingDaysPerWeek: v.optional(v.number()),
    sessionDurationMinutes: v.optional(v.number()),

    // Physical profile
    age: v.optional(v.number()),
    bodyWeight: v.optional(v.number()),

    // Limitations
    injuries: v.optional(v.array(v.string())),

    // Lifestyle
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

    // User preferences
    preferences: v.object({
      weightUnit: v.union(v.literal("kg"), v.literal("lbs")),
      defaultRestSeconds: v.number(),
      darkMode: v.boolean(),
    }),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_email", ["email"]),

  // ============================================
  // WORKOUT TEMPLATES
  // ============================================

  /**
   * WorkoutTemplates - Reusable workout plans
   * Examples: "Push Day A", "Pull Hypertrophy", "Leg Strength"
   */
  workoutTemplates: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),

    // Categorization for organization
    category: v.optional(v.union(
      v.literal("push"),
      v.literal("pull"),
      v.literal("legs"),
      v.literal("upper"),
      v.literal("lower"),
      v.literal("full_body"),
      v.literal("custom")
    )),

    isActive: v.boolean(),       // Soft delete flag
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_user_category", ["userId", "category"]),

  /**
   * TemplateExercises - Exercises within a template
   * Ordered list defining the workout structure
   */
  templateExercises: defineTable({
    templateId: v.id("workoutTemplates"),

    // Exercise identification
    exerciseName: v.string(),                           // User's raw input (e.g., "bench press", "BP", "Bench")
    standardizedExerciseId: v.optional(v.id("exerciseLibrary")),  // Link to standard definition

    // Ordering
    orderIndex: v.number(),                             // 0, 1, 2... for display order

    // Prescribed targets
    targetSets: v.optional(v.number()),
    targetRepsMin: v.optional(v.number()),              // For ranges like "8-12 reps"
    targetRepsMax: v.optional(v.number()),
    targetWeight: v.optional(v.number()),               // Absolute weight or null
    targetWeightPercent1RM: v.optional(v.number()),     // e.g., 80 for 80% of 1RM
    restSeconds: v.optional(v.number()),

    // Training metrics
    targetRPE: v.optional(v.number()),                  // Rate of Perceived Exertion (1-10)
    targetRIR: v.optional(v.number()),                  // Reps in Reserve

    notes: v.optional(v.string()),                      // Form cues, tempo, etc.
    createdAt: v.number(),
  })
    .index("by_template", ["templateId"])
    .index("by_template_order", ["templateId", "orderIndex"]),

  // ============================================
  // WORKOUT LOGGING
  // ============================================

  /**
   * WorkoutSessions - Actual workout instances
   * Immutable log of each training session
   */
  workoutSessions: defineTable({
    userId: v.id("users"),
    templateId: v.optional(v.id("workoutTemplates")),   // null for freestyle workouts
    templateName: v.string(),                           // Denormalized for history stability

    // Timing
    startedAt: v.number(),
    completedAt: v.optional(v.number()),                // null = in-progress
    durationMinutes: v.optional(v.number()),            // Computed on completion

    // Aggregate metrics (computed for analytics)
    totalVolume: v.optional(v.number()),                // Sum of (weight × reps) across all sets
    totalSets: v.optional(v.number()),
    totalReps: v.optional(v.number()),

    notes: v.optional(v.string()),                      // Session-level notes
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_completed", ["userId", "completedAt"])  // Critical for timeline queries
    .index("by_template", ["templateId"])
    .index("by_user_started", ["userId", "startedAt"]),

  /**
   * SessionExercises - Exercises performed in a session
   * Bridge between sessions and sets
   */
  sessionExercises: defineTable({
    sessionId: v.id("workoutSessions"),
    templateExerciseId: v.optional(v.id("templateExercises")), // Link if from template

    // Exercise identification (denormalized for stability)
    exerciseName: v.string(),
    standardizedExerciseId: v.optional(v.id("exerciseLibrary")),

    orderIndex: v.number(),                             // Preserve order within session
    notes: v.optional(v.string()),                      // Exercise-specific notes for this session

    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_order", ["sessionId", "orderIndex"])
    .index("by_standardized_exercise", ["standardizedExerciseId"]), // For progression tracking

  /**
   * Sets - Individual set data
   * Granular performance tracking
   */
  sets: defineTable({
    sessionExerciseId: v.id("sessionExercises"),

    setNumber: v.number(),                              // 1, 2, 3...
    weight: v.number(),                                 // In user's preferred unit
    reps: v.number(),

    // Advanced metrics
    rpe: v.optional(v.number()),                        // Rate of Perceived Exertion (1-10)
    rir: v.optional(v.number()),                        // Reps in Reserve (0-5+)

    // Set classification
    isWarmup: v.boolean(),
    isPR: v.boolean(),                                  // Auto-flagged if new PR

    completedAt: v.number(),
    notes: v.optional(v.string()),                      // e.g., "Felt easy", "Grinder"
  })
    .index("by_session_exercise", ["sessionExerciseId"])
    .index("by_session_exercise_set", ["sessionExerciseId", "setNumber"])
    .index("by_completed", ["completedAt"]),            // For recent activity feeds

  // ============================================
  // EXERCISE LIBRARY
  // ============================================

  /**
   * ExerciseLibrary - Standardized exercise definitions
   * Enables cross-user analytics and fuzzy matching
   */
  exerciseLibrary: defineTable({
    name: v.string(),                                   // Canonical name
    aliases: v.array(v.string()),                       // ["BP", "bench", "flat bench", etc.]

    // Classification
    category: v.union(
      v.literal("compound"),
      v.literal("isolation")
    ),
    movementPattern: v.union(
      v.literal("horizontal_push"),
      v.literal("vertical_push"),
      v.literal("horizontal_pull"),
      v.literal("vertical_pull"),
      v.literal("squat"),
      v.literal("hinge"),
      v.literal("lunge"),
      v.literal("carry"),
      v.literal("other")
    ),
    muscleGroups: v.array(v.string()),                  // ["chest", "triceps", "anterior_delts"]
    equipmentType: v.union(
      v.literal("barbell"),
      v.literal("dumbbell"),
      v.literal("machine"),
      v.literal("cable"),
      v.literal("bodyweight"),
      v.literal("other")
    ),

    // Analytics flags
    is1RMTracked: v.boolean(),                          // Some exercises don't make sense for 1RM

    // Optional media
    imageUrl: v.optional(v.string()),                   // Exercise demonstration image
    videoUrl: v.optional(v.string()),                   // Exercise demonstration video

    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_movement_pattern", ["movementPattern"])
    .index("by_equipment", ["equipmentType"]),

  // ============================================
  // ANALYTICS & RECORDS
  // ============================================

  /**
   * PersonalRecords - Track achievements
   * Motivational markers and progression milestones
   */
  personalRecords: defineTable({
    userId: v.id("users"),
    standardizedExerciseId: v.optional(v.id("exerciseLibrary")),
    exerciseName: v.string(),                           // Denormalized

    recordType: v.union(
      v.literal("estimated_1rm"),                       // Calculated from reps/weight
      v.literal("max_weight"),                          // Heaviest single weight used
      v.literal("max_volume"),                          // Highest weight × reps in one set
      v.literal("max_reps"),                            // Most reps at a given weight
      v.literal("total_session_volume")                 // Highest session volume for this exercise
    ),

    value: v.number(),

    // Context
    sessionId: v.id("workoutSessions"),
    setId: v.optional(v.id("sets")),
    achievedAt: v.number(),

    // Tracking if record is still current
    isCurrent: v.boolean(),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_exercise", ["userId", "standardizedExerciseId"])
    .index("by_user_exercise_type", ["userId", "standardizedExerciseId", "recordType"])
    .index("by_user_current", ["userId", "isCurrent"]),

  /**
   * VolumeMetrics - Pre-computed analytics
   * Time-series data for dashboard performance
   */
  volumeMetrics: defineTable({
    userId: v.id("users"),

    // Time grouping
    date: v.string(),                                   // ISO date string (YYYY-MM-DD)
    weekStartDate: v.string(),                          // ISO date of Monday

    // Aggregations
    totalVolume: v.number(),
    totalSets: v.number(),
    totalReps: v.number(),
    sessionsCompleted: v.number(),

    // Breakdown by muscle group (for advanced analytics)
    volumeByMuscleGroup: v.optional(v.object({
      chest: v.number(),
      back: v.number(),
      legs: v.number(),
      shoulders: v.number(),
      arms: v.number(),
      core: v.number(),
    })),

    computedAt: v.number(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_user_week", ["userId", "weekStartDate"]),

  // ============================================
  // FORM ANALYSIS
  // ============================================

  /**
   * FormAnalyses - AI video form-check results
   * Stores the full analysis text and extracted metadata per video submission.
   */
  formAnalyses: defineTable({
    userId: v.id("users"),
    exerciseName: v.string(),
    analysis: v.string(),
    formScore: v.optional(v.number()),
    issuesFound: v.optional(v.array(v.string())),
    videoFileName: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_exercise", ["userId", "exerciseName"])
    .index("by_user_created", ["userId", "createdAt"]),

  // ============================================
  // AI INTEGRATION
  // ============================================

  /**
   * AiInteractions - Log AI conversations
   * Provides context for follow-up queries and quality tracking
   */
  aiInteractions: defineTable({
    userId: v.id("users"),

    type: v.union(
      v.literal("programmer"),                          // Workout plan generation
      v.literal("trainer"),                             // Form/technique/progression advice
      v.literal("general")                              // General fitness questions
    ),

    prompt: v.string(),                                 // User's question/request
    response: v.string(),                               // AI's response

    // Context snapshot (for debugging and continuity)
    contextData: v.optional(v.object({
      templateIds: v.optional(v.array(v.id("workoutTemplates"))),
      sessionIds: v.optional(v.array(v.id("workoutSessions"))),
      recentVolume: v.optional(v.number()),
      experienceLevel: v.optional(v.string()),
    })),

    // Quality tracking
    userRating: v.optional(v.number()),                 // 1-5 thumbs up/down

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_created", ["userId", "createdAt"]), // Chronological conversations
});
