# Convex Backend - Quick Reference

## Files Overview

| File | Purpose |
|------|---------|
| `schema.ts` | Database schema definition with all tables, fields, and indexes |
| `ARCHITECTURE.md` | Comprehensive design documentation, relationships, and rationale |
| `types.ts` | TypeScript types, enums, and constants for type-safe development |

---

## Schema Summary

### Core Tables

```
users              → User profiles and preferences
workoutTemplates   → Reusable workout plans
templateExercises  → Exercises within templates (ordered)
workoutSessions    → Immutable workout logs
sessionExercises   → Exercises performed in a session
sets               → Individual set data (weight × reps)
exerciseLibrary    → Standardized exercise definitions
personalRecords    → PR tracking (1RM, max volume, etc.)
volumeMetrics      → Pre-computed analytics data
aiInteractions     → AI conversation history
```

### Key Relationships

```
User (1) ──> (M) WorkoutTemplates ──> (M) TemplateExercises
User (1) ──> (M) WorkoutSessions ──> (M) SessionExercises ──> (M) Sets
ExerciseLibrary (1) ──> (M) SessionExercises (for analytics)
User (1) ──> (M) PersonalRecords
User (1) ──> (M) VolumeMetrics (daily/weekly aggregates)
```

---

## Critical Indexes

### User Data Access
- `users.by_workos_id` - Auth lookups
- `workoutTemplates.by_user_active` - Template lists
- `workoutSessions.by_user_completed` - Timeline queries

### Analytics
- `volumeMetrics.by_user_date` - Time-series charts
- `sessionExercises.by_standardized_exercise` - Progression tracking
- `personalRecords.by_user_exercise_type` - PR lookups

### Ordering
- `templateExercises.by_template_order` - Ordered exercise lists
- `sessionExercises.by_session_order` - Workout flow
- `sets.by_session_exercise_set` - Set ordering

---

## Design Principles

### 1. Immutability
Workout logs (`workoutSessions`, `sessionExercises`, `sets`) are **append-only**.
- Once a session is completed, no edits allowed
- Ensures accurate historical tracking
- Enables reliable PR detection

### 2. Denormalization
Strategic data duplication for performance:
- `templateName` stored in `workoutSessions` (prevents broken history if template renamed)
- `exerciseName` stored in `sessionExercises` (preserves original names)

### 3. Optional Standardization
- Users can log any exercise name (freeform text)
- System attempts fuzzy matching to `exerciseLibrary`
- Analytics work with or without standardization

### 4. Pre-computed Metrics
- `totalVolume` in `workoutSessions` (computed on completion)
- `volumeMetrics` table (daily/weekly aggregates)
- Eliminates expensive aggregations at query time

---

## Common Queries

### Get User's Active Templates
```typescript
const templates = await ctx.db
  .query("workoutTemplates")
  .withIndex("by_user_active", q =>
    q.eq("userId", userId).eq("isActive", true)
  )
  .collect();
```

### Get Template with Exercises
```typescript
const template = await ctx.db.get(templateId);
const exercises = await ctx.db
  .query("templateExercises")
  .withIndex("by_template_order", q => q.eq("templateId", templateId))
  .collect();
```

### Get Recent Workout Sessions
```typescript
const sessions = await ctx.db
  .query("workoutSessions")
  .withIndex("by_user_completed", q =>
    q.eq("userId", userId).gte("completedAt", startDate)
  )
  .order("desc")
  .take(10);
```

### Get Session with Full Data
```typescript
const session = await ctx.db.get(sessionId);
const sessionExercises = await ctx.db
  .query("sessionExercises")
  .withIndex("by_session_order", q => q.eq("sessionId", sessionId))
  .collect();

const fullData = await Promise.all(
  sessionExercises.map(async (exercise) => ({
    exercise,
    sets: await ctx.db
      .query("sets")
      .withIndex("by_session_exercise", q =>
        q.eq("sessionExerciseId", exercise._id)
      )
      .collect(),
  }))
);
```

### Get Volume Analytics
```typescript
const metrics = await ctx.db
  .query("volumeMetrics")
  .withIndex("by_user_date", q =>
    q.eq("userId", userId)
     .gte("date", "2024-01-01")
     .lte("date", "2024-01-31")
  )
  .collect();

const totalVolume = metrics.reduce((sum, m) => sum + m.totalVolume, 0);
```

### Check for PRs
```typescript
const currentPRs = await ctx.db
  .query("personalRecords")
  .withIndex("by_user_exercise_type", q =>
    q.eq("userId", userId)
     .eq("standardizedExerciseId", exerciseId)
     .eq("recordType", "estimated_1rm")
  )
  .filter(q => q.eq(q.field("isCurrent"), true))
  .first();
```

---

## Mutation Patterns

### Create Workout Template
```typescript
// Insert template
const templateId = await ctx.db.insert("workoutTemplates", {
  userId,
  name: "Push Day A",
  category: "push",
  isActive: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Insert exercises (ordered)
await Promise.all(
  exercises.map((exercise, index) =>
    ctx.db.insert("templateExercises", {
      templateId,
      exerciseName: exercise.name,
      orderIndex: index,
      targetSets: exercise.sets,
      targetRepsMin: exercise.repsMin,
      targetRepsMax: exercise.repsMax,
      restSeconds: exercise.rest,
      createdAt: Date.now(),
    })
  )
);
```

### Start Workout Session
```typescript
const sessionId = await ctx.db.insert("workoutSessions", {
  userId,
  templateId,
  templateName,
  startedAt: Date.now(),
  createdAt: Date.now(),
});

// Create session exercises from template
const templateExercises = await ctx.db
  .query("templateExercises")
  .withIndex("by_template_order", q => q.eq("templateId", templateId))
  .collect();

await Promise.all(
  templateExercises.map((exercise) =>
    ctx.db.insert("sessionExercises", {
      sessionId,
      templateExerciseId: exercise._id,
      exerciseName: exercise.exerciseName,
      standardizedExerciseId: exercise.standardizedExerciseId,
      orderIndex: exercise.orderIndex,
      createdAt: Date.now(),
    })
  )
);
```

### Log a Set
```typescript
const setId = await ctx.db.insert("sets", {
  sessionExerciseId,
  setNumber,
  weight,
  reps,
  rpe,
  isWarmup: false,
  isPR: false,  // Will be updated by PR detection logic
  completedAt: Date.now(),
});

// Check if this is a PR
await checkAndUpdatePRs(ctx, userId, sessionExerciseId, setId);
```

### Complete Session
```typescript
// Calculate total volume
const sessionExercises = await ctx.db
  .query("sessionExercises")
  .withIndex("by_session", q => q.eq("sessionId", sessionId))
  .collect();

let totalVolume = 0;
let totalSets = 0;
let totalReps = 0;

for (const exercise of sessionExercises) {
  const sets = await ctx.db
    .query("sets")
    .withIndex("by_session_exercise", q =>
      q.eq("sessionExerciseId", exercise._id)
    )
    .filter(q => q.eq(q.field("isWarmup"), false))
    .collect();

  totalSets += sets.length;
  totalReps += sets.reduce((sum, set) => sum + set.reps, 0);
  totalVolume += sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
}

// Update session
await ctx.db.patch(sessionId, {
  completedAt: Date.now(),
  durationMinutes: Math.round((Date.now() - session.startedAt) / 60000),
  totalVolume,
  totalSets,
  totalReps,
});
```

---

## Analytics Calculations

### Estimated 1RM (Epley Formula)
```typescript
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}
```

### Plateau Detection
```typescript
async function detectPlateau(
  ctx: QueryCtx,
  userId: Id<"users">,
  exerciseId: Id<"exerciseLibrary">
): Promise<boolean> {
  // Get last 6 sessions for this exercise
  const recentExercises = await ctx.db
    .query("sessionExercises")
    .withIndex("by_standardized_exercise", q =>
      q.eq("standardizedExerciseId", exerciseId)
    )
    .order("desc")
    .take(6);

  // Get max weight from each session
  const maxWeights = await Promise.all(
    recentExercises.map(async (exercise) => {
      const sets = await ctx.db
        .query("sets")
        .withIndex("by_session_exercise", q =>
          q.eq("sessionExerciseId", exercise._id)
        )
        .filter(q => q.eq(q.field("isWarmup"), false))
        .collect();

      return Math.max(...sets.map(s => s.weight));
    })
  );

  // Check if weights are stagnant (within 2.5% variance)
  const avgWeight = maxWeights.reduce((a, b) => a + b, 0) / maxWeights.length;
  const isStagnant = maxWeights.every(
    w => Math.abs(w - avgWeight) / avgWeight < 0.025
  );

  return isStagnant && maxWeights.length >= 4;
}
```

### Volume Over Time
```typescript
async function getVolumeOverTime(
  ctx: QueryCtx,
  userId: Id<"users">,
  days: number
): Promise<{ date: string; volume: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = await ctx.db
    .query("volumeMetrics")
    .withIndex("by_user_date", q =>
      q.eq("userId", userId)
       .gte("date", startDate.toISOString().split("T")[0])
    )
    .collect();

  return metrics.map(m => ({
    date: m.date,
    volume: m.totalVolume,
  }));
}
```

---

## AI Context Preparation

### Context for Workout Programmer
```typescript
async function getAIProgrammerContext(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<string> {
  const user = await ctx.db.get(userId);
  const templates = await ctx.db
    .query("workoutTemplates")
    .withIndex("by_user_active", q =>
      q.eq("userId", userId).eq("isActive", true)
    )
    .collect();

  const recentSessions = await ctx.db
    .query("workoutSessions")
    .withIndex("by_user_completed", q =>
      q.eq("userId", userId)
    )
    .order("desc")
    .take(30);

  const context = {
    experienceLevel: user?.experienceLevel,
    currentTemplates: templates.map(t => t.name),
    weeklySessionCount: recentSessions.length / 4,
    avgSessionDuration: recentSessions.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    ) / recentSessions.length,
  };

  return JSON.stringify(context, null, 2);
}
```

### Context for Training Coach
```typescript
async function getAITrainerContext(
  ctx: QueryCtx,
  userId: Id<"users">,
  exerciseName?: string
): Promise<string> {
  const recentSessions = await ctx.db
    .query("workoutSessions")
    .withIndex("by_user_completed", q => q.eq("userId", userId))
    .order("desc")
    .take(10);

  // If asking about specific exercise, include progression data
  let exerciseData = null;
  if (exerciseName) {
    // Query exercise-specific data
    // ... (fetch recent performance for that exercise)
  }

  const context = {
    recentSessions: recentSessions.length,
    totalVolumeLast30Days: await getTotalVolume(ctx, userId, 30),
    exerciseSpecific: exerciseData,
  };

  return JSON.stringify(context, null, 2);
}
```

---

## Future Schema Extensions

### Planned Additions (already extensible)

**Supersets/Circuits:**
```typescript
// Add to templateExercises
supersetGroup: v.optional(v.string()),  // "A", "B", etc.
supersetType: v.optional(v.union(
  v.literal("superset"),
  v.literal("circuit")
)),
```

**Periodization:**
```typescript
// Add to workoutTemplates
mesocyclePhase: v.optional(v.string()),
weekNumber: v.optional(v.number()),
```

**Video Analysis:**
```typescript
// New table
formVideos: defineTable({
  sessionExerciseId: v.id("sessionExercises"),
  videoUrl: v.string(),
  aiAnalysis: v.optional(v.string()),
}),
```

---

## Performance Notes

### Expected Query Latencies
- Load user dashboard: <100ms (pre-computed metrics)
- Start workout: <50ms (single template lookup)
- Log a set: <30ms (simple insert)
- Analytics charts: <200ms (indexed time-series)

### Optimization Tips
1. Always use indexes for queries
2. Batch reads with `Promise.all()` when possible
3. Pre-compute expensive aggregations
4. Denormalize for read-heavy patterns
5. Use pagination for large result sets

---

## Development Workflow

### 1. Schema Changes
```bash
# Edit schema.ts
# Convex auto-pushes changes
# No manual migration needed for additive changes
```

### 2. Query Development
```bash
# Create query in convex/queries.ts
# Test in Convex dashboard
# Import in frontend
```

### 3. Mutation Development
```bash
# Create mutation in convex/mutations.ts
# Add validation logic
# Test with Convex dashboard
```

### 4. Testing
```bash
# Unit tests for business logic
# Integration tests with Convex dev deployment
# Test PR detection, volume calculations, etc.
```

---

## Next Steps (Implementation)

1. **Initialize Convex** - `npx convex dev`
2. **Seed Exercise Library** - Create mutation to populate standard exercises
3. **Create Auth Queries** - User lookup by WorkOS ID
4. **Build Core Mutations** - Template creation, session logging, set tracking
5. **Implement Analytics** - Volume calculations, PR detection, plateau analysis
6. **AI Integration** - Context preparation and response handling
7. **Frontend Integration** - React hooks for Convex queries/mutations

---

For detailed design rationale and relationships, see **ARCHITECTURE.md**.
