# Entity Relationship Diagram

## Visual Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                               USERS (Root)                                  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  _id: Id<"users">                                                    │   │
│  │  workosId: string          [UNIQUE]                                  │   │
│  │  email: string                                                       │   │
│  │  name?: string                                                       │   │
│  │  experienceLevel: "beginner" | "intermediate" | "advanced"           │   │
│  │  preferences: {                                                      │   │
│  │    weightUnit: "kg" | "lbs"                                          │   │
│  │    defaultRestSeconds: number                                        │   │
│  │    darkMode: boolean                                                 │   │
│  │  }                                                                   │   │
│  │  createdAt: number                                                   │   │
│  │  updatedAt: number                                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
┌───────────────────┐          ┌───────────────────┐         ┌──────────────────┐
│ WORKOUT TEMPLATES │          │ WORKOUT SESSIONS  │         │ PERSONAL RECORDS │
│   (Blueprints)    │          │  (Actual Logs)    │         │   (Achievements) │
└───────────────────┘          └───────────────────┘         └──────────────────┘
        │                              │                              │
        │                              │                              │
        ▼                              ▼                              ▼

┌──────────────────────────────────────────────────────────────────────────────┐
│                          WORKOUT TEMPLATES                                   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  _id: Id<"workoutTemplates">                                           │  │
│  │  userId: Id<"users">                         [INDEX: by_user]          │  │
│  │  name: string                                e.g., "Push Day A"        │  │
│  │  description?: string                                                  │  │
│  │  category?: "push" | "pull" | "legs" | ...   [INDEX: by_user_category]│  │
│  │  isActive: boolean                           [INDEX: by_user_active]   │  │
│  │  createdAt: number                                                     │  │
│  │  updatedAt: number                                                     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                                    │                                         │
│                                    │ 1:M                                     │
│                                    ▼                                         │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                       TEMPLATE EXERCISES                               │  │
│  │  (Ordered list of exercises in the template)                           │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │  _id: Id<"templateExercises">                                          │  │
│  │  templateId: Id<"workoutTemplates">          [INDEX: by_template]      │  │
│  │  exerciseName: string                        User's raw input          │  │
│  │  standardizedExerciseId?: Id<"exerciseLibrary">  (optional link)       │  │
│  │  orderIndex: number                          [INDEX: by_template_order]│  │
│  │  targetSets?: number                                                   │  │
│  │  targetRepsMin?: number                      For ranges like "8-12"    │  │
│  │  targetRepsMax?: number                                                │  │
│  │  targetWeight?: number                                                 │  │
│  │  targetWeightPercent1RM?: number             e.g., 80 for 80% of 1RM   │  │
│  │  restSeconds?: number                                                  │  │
│  │  targetRPE?: number                          Rate of Perceived Exertion│  │
│  │  targetRIR?: number                          Reps in Reserve           │  │
│  │  notes?: string                              Form cues, tempo, etc.    │  │
│  │  createdAt: number                                                     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                          WORKOUT SESSIONS                                    │
│                          (Immutable Logs)                                    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  _id: Id<"workoutSessions">                                            │  │
│  │  userId: Id<"users">                         [INDEX: by_user]          │  │
│  │  templateId?: Id<"workoutTemplates">         null = freestyle workout  │  │
│  │  templateName: string                        [DENORMALIZED]            │  │
│  │  startedAt: number                           [INDEX: by_user_started]  │  │
│  │  completedAt?: number                        [INDEX: by_user_completed]│  │
│  │  durationMinutes?: number                    Computed on completion    │  │
│  │  totalVolume?: number                        [PRE-COMPUTED]            │  │
│  │  totalSets?: number                          [PRE-COMPUTED]            │  │
│  │  totalReps?: number                          [PRE-COMPUTED]            │  │
│  │  notes?: string                                                        │  │
│  │  createdAt: number                                                     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                                    │                                         │
│                                    │ 1:M                                     │
│                                    ▼                                         │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                       SESSION EXERCISES                                │  │
│  │  (Exercises performed in this session)                                 │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │  _id: Id<"sessionExercises">                                           │  │
│  │  sessionId: Id<"workoutSessions">            [INDEX: by_session]       │  │
│  │  templateExerciseId?: Id<"templateExercises">  (if from template)      │  │
│  │  exerciseName: string                        [DENORMALIZED]            │  │
│  │  standardizedExerciseId?: Id<"exerciseLibrary">                        │  │
│  │                                              [INDEX: by_standardized]   │  │
│  │  orderIndex: number                          [INDEX: by_session_order] │  │
│  │  notes?: string                                                        │  │
│  │  createdAt: number                                                     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                                    │                                         │
│                                    │ 1:M                                     │
│                                    ▼                                         │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                            SETS                                        │  │
│  │  (Individual set performance data)                                     │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │  _id: Id<"sets">                                                       │  │
│  │  sessionExerciseId: Id<"sessionExercises">                             │  │
│  │                                              [INDEX: by_session_exercise]│  │
│  │  setNumber: number                           1, 2, 3, ...              │  │
│  │  weight: number                              In user's preferred unit  │  │
│  │  reps: number                                                          │  │
│  │  rpe?: number                                Rate of Perceived Exertion│  │
│  │  rir?: number                                Reps in Reserve           │  │
│  │  isWarmup: boolean                           Exclude from analytics    │  │
│  │  isPR: boolean                               Auto-flagged              │  │
│  │  completedAt: number                         [INDEX: by_completed]     │  │
│  │  notes?: string                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                        EXERCISE LIBRARY                                      │
│                        (Reference Data)                                      │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  _id: Id<"exerciseLibrary">                                            │  │
│  │  name: string                                [INDEX: by_name]          │  │
│  │  aliases: string[]                           ["BP", "bench", etc.]     │  │
│  │  category: "compound" | "isolation"                                    │  │
│  │  movementPattern: "horizontal_push" | ...    [INDEX: by_movement]      │  │
│  │  muscleGroups: string[]                      ["chest", "triceps", ...] │  │
│  │  equipmentType: "barbell" | "dumbbell" | ... [INDEX: by_equipment]     │  │
│  │  is1RMTracked: boolean                                                 │  │
│  │  createdAt: number                                                     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                                    ▲                                         │
│                                    │                                         │
│                                    │ Referenced by                           │
│                                    │                                         │
│              ┌─────────────────────┼─────────────────────┐                   │
│              │                     │                     │                   │
│    TemplateExercises      SessionExercises      PersonalRecords              │
│  (standardizedExerciseId) (standardizedExerciseId) (standardizedExerciseId)  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                        PERSONAL RECORDS                                      │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  _id: Id<"personalRecords">                                            │  │
│  │  userId: Id<"users">                         [INDEX: by_user]          │  │
│  │  standardizedExerciseId?: Id<"exerciseLibrary">                        │  │
│  │                                              [INDEX: by_user_exercise]  │  │
│  │  exerciseName: string                        [DENORMALIZED]            │  │
│  │  recordType: "estimated_1rm" | "max_weight" | ...                      │  │
│  │                                              [INDEX: by_user_exercise_type]│
│  │  value: number                                                         │  │
│  │  sessionId: Id<"workoutSessions">            Context reference         │  │
│  │  setId?: Id<"sets">                          Specific set (if applicable)│ │
│  │  achievedAt: number                                                    │  │
│  │  isCurrent: boolean                          [INDEX: by_user_current]  │  │
│  │  createdAt: number                                                     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                         VOLUME METRICS                                       │
│                         (Pre-computed Analytics)                             │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  _id: Id<"volumeMetrics">                                              │  │
│  │  userId: Id<"users">                                                   │  │
│  │  date: string                                ISO date (YYYY-MM-DD)     │  │
│  │                                              [INDEX: by_user_date]     │  │
│  │  weekStartDate: string                       ISO date of Monday        │  │
│  │                                              [INDEX: by_user_week]     │  │
│  │  totalVolume: number                         Sum(weight × reps)        │  │
│  │  totalSets: number                                                     │  │
│  │  totalReps: number                                                     │  │
│  │  sessionsCompleted: number                                             │  │
│  │  volumeByMuscleGroup?: {                                               │  │
│  │    chest: number                                                       │  │
│  │    back: number                                                        │  │
│  │    legs: number                                                        │  │
│  │    shoulders: number                                                   │  │
│  │    arms: number                                                        │  │
│  │    core: number                                                        │  │
│  │  }                                                                     │  │
│  │  computedAt: number                                                    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Note: Updated via scheduled cron jobs for performance                      │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                         AI INTERACTIONS                                      │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  _id: Id<"aiInteractions">                                             │  │
│  │  userId: Id<"users">                         [INDEX: by_user]          │  │
│  │  type: "programmer" | "trainer" | "general"  [INDEX: by_user_type]     │  │
│  │  prompt: string                              User's question           │  │
│  │  response: string                            AI's answer               │  │
│  │  contextData?: {                             Snapshot for continuity   │  │
│  │    templateIds?: Id<"workoutTemplates">[]                              │  │
│  │    sessionIds?: Id<"workoutSessions">[]                                │  │
│  │    recentVolume?: number                                               │  │
│  │    experienceLevel?: string                                            │  │
│  │  }                                                                     │  │
│  │  userRating?: number                         1-5 feedback              │  │
│  │  createdAt: number                           [INDEX: by_user_created]  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Relationships

### User Ownership (1:M)
```
users (1) ──── (M) workoutTemplates
users (1) ──── (M) workoutSessions
users (1) ──── (M) personalRecords
users (1) ──── (M) volumeMetrics
users (1) ──── (M) aiInteractions
```

### Template Hierarchy (1:M)
```
workoutTemplates (1) ──── (M) templateExercises
templateExercises (0..1) ──── (1) exerciseLibrary [optional]
```

### Session Hierarchy (1:M:M)
```
workoutSessions (1) ──── (M) sessionExercises ──── (M) sets
sessionExercises (0..1) ──── (1) exerciseLibrary [optional]
sessionExercises (0..1) ──── (1) templateExercises [if from template]
```

### Reference Relationships
```
exerciseLibrary (1) ──── (M) templateExercises [standardization]
exerciseLibrary (1) ──── (M) sessionExercises [analytics]
exerciseLibrary (1) ──── (M) personalRecords [tracking]

workoutSessions (1) ──── (M) personalRecords [achievement context]
sets (0..1) ──── (1) personalRecords [specific PR set]
```

---

## Data Flow: Creating a Workout

```
1. User creates template
   └─> INSERT workoutTemplates
       └─> INSERT templateExercises (ordered)
           └─> OPTIONAL: Link to exerciseLibrary

2. User starts workout from template
   └─> INSERT workoutSessions (startedAt = now, completedAt = null)
       └─> COPY templateExercises → sessionExercises
           └─> Preserve templateExerciseId link
           └─> Denormalize exerciseName

3. User logs sets
   └─> INSERT sets (weight, reps, rpe, etc.)
       └─> Check for PRs
           └─> UPDATE sets.isPR = true
           └─> INSERT personalRecords (if new PR)
               └─> UPDATE old PR records: isCurrent = false

4. User completes workout
   └─> UPDATE workoutSessions:
       ├─> completedAt = now
       ├─> durationMinutes = calculated
       ├─> totalVolume = SUM(weight × reps) [non-warmup]
       ├─> totalSets = COUNT(sets) [non-warmup]
       └─> totalReps = SUM(reps) [non-warmup]

5. Daily cron job
   └─> AGGREGATE completed sessions from yesterday
       └─> UPSERT volumeMetrics (by date)
           ├─> totalVolume
           ├─> totalSets
           ├─> totalReps
           ├─> sessionsCompleted
           └─> volumeByMuscleGroup (using exerciseLibrary.muscleGroups)
```

---

## Data Flow: Analytics Queries

```
Dashboard View
├─> Query: volumeMetrics (last 7/30/90 days)
│   └─> Fast: Pre-aggregated daily data
│
├─> Query: personalRecords (isCurrent = true, limit 5)
│   └─> Recent PRs for motivation
│
└─> Query: workoutSessions (last 10, completedAt DESC)
    └─> Recent activity timeline

Exercise Progression Chart
├─> Query: sessionExercises (by standardizedExerciseId)
│   └─> For each: Query sets → Calculate max weight, volume
│       └─> Plot over time
│
└─> Detect plateau: Check if flat-lined for 3+ weeks

AI Programmer
├─> Query: users (get experienceLevel)
├─> Query: workoutTemplates (current program)
├─> Query: volumeMetrics (last 30 days → frequency)
└─> Gemini API: Generate new program based on context

AI Trainer
├─> Query: sessionExercises + sets (specific exercise progression)
├─> Query: personalRecords (check for PRs, stagnation)
├─> Query: aiInteractions (conversation history)
└─> Gemini API: Answer with context-aware advice
```

---

## Index Usage Patterns

### Hot Paths (Every Request)
```sql
-- Auth lookup
users.by_workos_id → O(log n)

-- Template lists
workoutTemplates.by_user_active → O(log n)

-- Session timeline
workoutSessions.by_user_completed → O(log n) + range scan
```

### Analytics Paths (Dashboard)
```sql
-- Volume charts
volumeMetrics.by_user_date → O(log n) + range scan

-- Exercise progression
sessionExercises.by_standardized_exercise → O(log n) + filter

-- PR checks
personalRecords.by_user_exercise_type → O(log n)
```

### Ordered Data Paths
```sql
-- Template exercise list (preserves order)
templateExercises.by_template_order → O(log n) + sorted scan

-- Session exercise list (workout flow)
sessionExercises.by_session_order → O(log n) + sorted scan

-- Set list (sequential)
sets.by_session_exercise_set → O(log n) + sorted scan
```

---

## Denormalization Map

| Source | Denormalized To | Reason |
|--------|----------------|--------|
| `workoutTemplates.name` | `workoutSessions.templateName` | Template can be renamed/deleted |
| `templateExercises.exerciseName` | `sessionExercises.exerciseName` | Exercise name can change |
| `exerciseLibrary.name` | `personalRecords.exerciseName` | Exercise can be removed from library |
| Session aggregations | `workoutSessions.totalVolume/Sets/Reps` | Avoid expensive JOINs on dashboard |
| Daily aggregations | `volumeMetrics.*` | Real-time aggregation too slow for charts |

---

## Immutability Guarantees

### Append-Only Tables
- `workoutSessions` (after `completedAt` is set)
- `sessionExercises` (created with session)
- `sets` (individual performance logs)
- `personalRecords` (historical PRs, use `isCurrent` flag)
- `aiInteractions` (conversation history)

### Mutable Tables
- `users` (profile updates, preference changes)
- `workoutTemplates` (user can edit their templates)
- `templateExercises` (editable with template)
- `volumeMetrics` (recomputed if corrections needed)

### Soft Deletes
- `workoutTemplates.isActive = false` (preserve history references)
- `personalRecords.isCurrent = false` (maintain PR history)

---

## Query Optimization Examples

### ❌ Slow (No Index)
```typescript
// Anti-pattern: Full table scan
const sessions = await ctx.db
  .query("workoutSessions")
  .collect()
  .then(all => all.filter(s => s.userId === userId));
```

### ✅ Fast (Indexed)
```typescript
// Optimal: Index-backed query
const sessions = await ctx.db
  .query("workoutSessions")
  .withIndex("by_user", q => q.eq("userId", userId))
  .collect();
```

### ❌ Slow (Multiple Round-trips)
```typescript
// Anti-pattern: N+1 queries
for (const session of sessions) {
  const exercises = await ctx.db
    .query("sessionExercises")
    .withIndex("by_session", q => q.eq("sessionId", session._id))
    .collect();
}
```

### ✅ Fast (Batched)
```typescript
// Optimal: Parallel queries
const allExercises = await Promise.all(
  sessions.map(session =>
    ctx.db
      .query("sessionExercises")
      .withIndex("by_session", q => q.eq("sessionId", session._id))
      .collect()
  )
);
```

---

This ERD provides a comprehensive view of the schema structure, relationships, and access patterns. Use it alongside ARCHITECTURE.md for implementation reference.
