/**
 * Shared type definitions for Convex schema
 * These types mirror the schema and provide type safety across the app
 */

import { Doc, Id } from "./_generated/dataModel";

// ============================================
// DOMAIN TYPES
// ============================================

export type User = Doc<"users">;
export type WorkoutTemplate = Doc<"workoutTemplates">;
export type TemplateExercise = Doc<"templateExercises">;
export type WorkoutSession = Doc<"workoutSessions">;
export type SessionExercise = Doc<"sessionExercises">;
export type Set = Doc<"sets">;
export type ExerciseLibrary = Doc<"exerciseLibrary">;
export type PersonalRecord = Doc<"personalRecords">;
export type VolumeMetric = Doc<"volumeMetrics">;
export type AiInteraction = Doc<"aiInteractions">;

// ============================================
// ENUMS (matching schema unions)
// ============================================

export const ExperienceLevel = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type ExperienceLevelType = typeof ExperienceLevel[keyof typeof ExperienceLevel];

export const WorkoutCategory = {
  PUSH: "push",
  PULL: "pull",
  LEGS: "legs",
  UPPER: "upper",
  LOWER: "lower",
  FULL_BODY: "full_body",
  CUSTOM: "custom",
} as const;

export type WorkoutCategoryType = typeof WorkoutCategory[keyof typeof WorkoutCategory];

export const MovementPattern = {
  HORIZONTAL_PUSH: "horizontal_push",
  VERTICAL_PUSH: "vertical_push",
  HORIZONTAL_PULL: "horizontal_pull",
  VERTICAL_PULL: "vertical_pull",
  SQUAT: "squat",
  HINGE: "hinge",
  LUNGE: "lunge",
  CARRY: "carry",
  OTHER: "other",
} as const;

export type MovementPatternType = typeof MovementPattern[keyof typeof MovementPattern];

export const EquipmentType = {
  BARBELL: "barbell",
  DUMBBELL: "dumbbell",
  MACHINE: "machine",
  CABLE: "cable",
  BODYWEIGHT: "bodyweight",
  OTHER: "other",
} as const;

export type EquipmentTypeType = typeof EquipmentType[keyof typeof EquipmentType];

export const ExerciseCategory = {
  COMPOUND: "compound",
  ISOLATION: "isolation",
} as const;

export type ExerciseCategoryType = typeof ExerciseCategory[keyof typeof ExerciseCategory];

export const RecordType = {
  ESTIMATED_1RM: "estimated_1rm",
  MAX_WEIGHT: "max_weight",
  MAX_VOLUME: "max_volume",
  MAX_REPS: "max_reps",
  TOTAL_SESSION_VOLUME: "total_session_volume",
} as const;

export type RecordTypeType = typeof RecordType[keyof typeof RecordType];

export const AiInteractionType = {
  PROGRAMMER: "programmer",
  TRAINER: "trainer",
  GENERAL: "general",
} as const;

export type AiInteractionTypeType = typeof AiInteractionType[keyof typeof AiInteractionType];

export const WeightUnit = {
  KG: "kg",
  LBS: "lbs",
} as const;

export type WeightUnitType = typeof WeightUnit[keyof typeof WeightUnit];

// ============================================
// COMPOSITE TYPES (for complex queries)
// ============================================

/**
 * Full template with exercises
 */
export interface TemplateWithExercises {
  template: WorkoutTemplate;
  exercises: TemplateExercise[];
}

/**
 * Full session with exercises and sets
 */
export interface SessionWithData {
  session: WorkoutSession;
  exercises: Array<{
    exercise: SessionExercise;
    sets: Set[];
  }>;
}

/**
 * Exercise progression data point
 */
export interface ExerciseProgressionPoint {
  date: number;
  sessionId: Id<"workoutSessions">;
  maxWeight: number;
  maxReps: number;
  totalVolume: number;
  avgRPE?: number;
}

/**
 * PR achievement with context
 */
export interface PRWithContext {
  record: PersonalRecord;
  session: WorkoutSession;
  set?: Set;
}

/**
 * Analytics summary
 */
export interface AnalyticsSummary {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  sessionsCompleted: number;
  uniqueExercises: number;
  avgSessionDuration: number;
  recentPRs: PersonalRecord[];
}

/**
 * Workout session summary (for lists)
 */
export interface SessionSummary {
  sessionId: Id<"workoutSessions">;
  templateName: string;
  completedAt: number;
  durationMinutes: number;
  totalVolume: number;
  exerciseCount: number;
  setCount: number;
}

// ============================================
// INPUT TYPES (for mutations)
// ============================================

/**
 * Input for creating a workout template
 */
export interface CreateTemplateInput {
  name: string;
  description?: string;
  category?: WorkoutCategoryType;
  exercises: Array<{
    exerciseName: string;
    orderIndex: number;
    targetSets?: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
    restSeconds?: number;
    notes?: string;
  }>;
}

/**
 * Input for logging a set
 */
export interface LogSetInput {
  sessionExerciseId: Id<"sessionExercises">;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  rir?: number;
  isWarmup: boolean;
  notes?: string;
}

/**
 * Input for starting a workout
 */
export interface StartWorkoutInput {
  templateId?: Id<"workoutTemplates">;
  templateName: string;
  exercises: Array<{
    exerciseName: string;
    orderIndex: number;
    notes?: string;
  }>;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Date range for analytics queries
 */
export interface DateRange {
  start: number;
  end: number;
}

/**
 * Muscle group volume breakdown
 */
export interface MuscleGroupVolumes {
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
  core: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  weightUnit: WeightUnitType;
  defaultRestSeconds: number;
  darkMode: boolean;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Default rest periods by exercise type (seconds)
 */
export const DEFAULT_REST_SECONDS = {
  COMPOUND: 180,      // 3 minutes for squats, deadlifts, etc.
  ISOLATION: 90,      // 90 seconds for curls, raises, etc.
  DEFAULT: 120,       // 2 minutes fallback
} as const;

/**
 * 1RM estimation formula constants
 */
export const ONE_RM_FORMULAS = {
  EPLEY: (weight: number, reps: number) => weight * (1 + reps / 30),
  BRZYCKI: (weight: number, reps: number) => weight * (36 / (37 - reps)),
  LOMBARDI: (weight: number, reps: number) => weight * Math.pow(reps, 0.1),
} as const;

/**
 * Experience level thresholds
 */
export const EXPERIENCE_THRESHOLDS = {
  BEGINNER_TO_INTERMEDIATE: {
    minMonths: 6,
    minSessions: 48,
  },
  INTERMEDIATE_TO_ADVANCED: {
    minMonths: 24,
    minSessions: 200,
  },
} as const;

/**
 * Plateau detection settings
 */
export const PLATEAU_DETECTION = {
  MIN_SESSIONS: 4,              // Need at least 4 sessions to detect
  MAX_WEIGHT_VARIANCE: 0.025,   // ±2.5% weight change = plateau
  WEEKS_THRESHOLD: 3,           // 3 weeks without progress
} as const;

/**
 * Volume calculation settings
 */
export const VOLUME_SETTINGS = {
  EXCLUDE_WARMUP: true,
  MIN_REPS_FOR_VOLUME: 1,
  MAX_REPS_FOR_STRENGTH: 5,     // ≤5 reps = strength focus
  MIN_REPS_FOR_HYPERTROPHY: 6,  // 6-12 reps = hypertrophy focus
  MAX_REPS_FOR_HYPERTROPHY: 12,
} as const;
