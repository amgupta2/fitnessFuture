# Convex Data Architecture - Next-Gen Fitness Platform

## Table of Contents
1. [Overview](#overview)
2. [Entity-Relationship Model](#entity-relationship-model)
3. [Table Descriptions](#table-descriptions)
4. [Index Strategy](#index-strategy)
5. [Access Patterns](#access-patterns)
6. [Design Decisions](#design-decisions)
7. [Analytics Optimization](#analytics-optimization)
8. [AI Integration Points](#ai-integration-points)
9. [Future Extensibility](#future-extensibility)

---

## Overview

This architecture prioritizes:
- **Immutability**: Workout logs are append-only for accurate historical tracking
- **Denormalization**: Strategic data duplication for query performance
- **Isolation**: Complete user data separation via userId indexes
- **Time-series optimization**: Efficient date-range queries for analytics
- **AI-readiness**: Structured context extraction for Gemini prompts

---

## Entity-Relationship Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ECOSYSTEM                          │
└─────────────────────────────────────────────────────────────────┘

users (1) ──┬─── (M) workoutTemplates
            │
            ├─── (M) workoutSessions
            │
            ├─── (M) personalRecords
            │
            ├─── (M) volumeMetrics
            │
            └─── (M) aiInteractions

┌─────────────────────────────────────────────────────────────────┐
│                      TEMPLATE HIERARCHY                         │
└─────────────────────────────────────────────────────────────────┘

workoutTemplates (1) ─── (M) templateExercises ───> (?) exerciseLibrary

┌─────────────────────────────────────────────────────────────────┐
│                       SESSION HIERARCHY                         │
└─────────────────────────────────────────────────────────────────┘

workoutSessions (1) ─── (M) sessionExercises ─── (M) sets
                              │
                              └──> (?) exerciseLibrary

┌─────────────────────────────────────────────────────────────────┐
│                      REFERENCE DATA                             │
└─────────────────────────────────────────────────────────────────┘

exerciseLibrary (1) ──┬─── (M) templateExercises
                      │
                      ├─── (M) sessionExercises
                      │
                      └─── (M) personalRecords
```

---

## Table Descriptions

### 1. **users**
**Purpose:** Core user profile and preferences
**Owner:** System (1:1 with WorkOS userId)
**Mutability:** Frequently updated (preferences, experience level)

**Key Fields:**
- `workosId`: External auth reference (unique)
- `experienceLevel`: Drives AI programming logic (beginner/intermediate/advanced)
- `preferences`: User settings for units, defaults, UI preferences

**Why this design:**
- Separates auth (WorkOS) from application data
- Preferences stored as nested object for atomic updates
- Experience level informs AI training recommendations

---

### 2. **workoutTemplates**
**Purpose:** Reusable workout blueprints
**Owner:** User (1:M)
**Mutability:** Editable (but creates new sessions on use)

**Key Fields:**
- `category`: Enables filtering and organization
- `isActive`: Soft delete preserves historical references

**Why this design:**
- Templates are mutable to allow refinement over time
- Session creation snapshots template state (immutable log)
- Categories support AI-driven program design

**Example:**
```typescript
{
  name: "Push Hypertrophy A",
  category: "push",
  isActive: true
}
```

---

### 3. **templateExercises**
**Purpose:** Ordered exercise list within a template
**Owner:** Template (M:1)
**Mutability:** Editable with template

**Key Fields:**
- `orderIndex`: Critical for workout flow
- `exerciseName`: User's raw input (flexible)
- `standardizedExerciseId`: Optional link for analytics
- `targetReps{Min,Max}`: Supports ranges (e.g., "8-12")
- `targetWeightPercent1RM`: Enables auto-calculation

**Why this design:**
- Preserves user's original exercise naming
- Optional standardization allows gradual normalization
- Rep ranges common in hypertrophy programming
- Percentage-based loading for strength programs

---

### 4. **workoutSessions**
**Purpose:** Immutable log of actual workouts
**Owner:** User (1:M)
**Mutability:** Append-only (except completion timestamp)

**Key Fields:**
- `templateName`: Denormalized to preserve history if template renamed/deleted
- `completedAt`: Null = in-progress session
- `totalVolume`: Pre-computed for dashboard performance

**Why this design:**
- Denormalization ensures historical accuracy
- Aggregate metrics avoid expensive JOINs in analytics
- In-progress sessions enable "resume workout" feature

**Immutability principle:**
Once `completedAt` is set, no further edits allowed. This ensures:
- Accurate progression tracking
- Trustworthy PR detection
- Reliable analytics

---

### 5. **sessionExercises**
**Purpose:** Bridge table between sessions and sets
**Owner:** Session (M:1)
**Mutability:** Append-only

**Key Fields:**
- `exerciseName`: Denormalized from template
- `standardizedExerciseId`: Links to exercise library for analytics
- `orderIndex`: Preserves workout flow

**Why this design:**
- Normalizes the M:M relationship (session ↔ exercises)
- Enables per-exercise session notes
- Links to standardized definitions without forcing it

---

### 6. **sets**
**Purpose:** Granular performance data
**Owner:** SessionExercise (M:1)
**Mutability:** Append-only

**Key Fields:**
- `weight` + `reps`: Core performance metrics
- `rpe` / `rir`: Advanced training metrics
- `isWarmup`: Excludes from volume calculations
- `isPR`: Auto-flagged by mutation logic

**Why this design:**
- Granular data enables:
  - Estimated 1RM calculations (Epley/Brzycki formulas)
  - Volume load trending
  - Fatigue analysis (RPE patterns)
- Warmup flag prevents skewed analytics
- PR detection motivates users

---

### 7. **exerciseLibrary**
**Purpose:** Canonical exercise definitions
**Owner:** System (pre-seeded, admin-managed)
**Mutability:** Rare updates

**Key Fields:**
- `name`: Canonical form (e.g., "Barbell Bench Press")
- `aliases`: Fuzzy matching array
- `movementPattern`: Groups exercises for balanced programming
- `muscleGroups`: Enables volume distribution analytics

**Why this design:**
- Fuzzy matching handles user input variations
- Movement patterns support AI program design
- Muscle group tracking detects imbalances
- `is1RMTracked` flag excludes exercises like "Face Pulls" from strength calculations

**Example:**
```typescript
{
  name: "Barbell Bench Press",
  aliases: ["bench", "BP", "flat bench", "bb bench"],
  movementPattern: "horizontal_push",
  muscleGroups: ["chest", "triceps", "anterior_delts"],
  equipmentType: "barbell",
  is1RMTracked: true
}
```

---

### 8. **personalRecords**
**Purpose:** Track and celebrate achievements
**Owner:** User (1:M)
**Mutability:** Append-only (old records marked `isCurrent: false`)

**Key Fields:**
- `recordType`: Multiple PR categories
- `isCurrent`: Enables "active PRs" queries
- `sessionId` / `setId`: Deep links to achievement moment

**Why this design:**
- Multiple record types capture different strength qualities
- Historical PR tracking shows long-term progression
- Deep links enable "relive this moment" UX

**Record Types:**
- `estimated_1rm`: Calculated via Epley formula
- `max_weight`: Heaviest load lifted
- `max_volume`: Highest weight × reps in a single set
- `total_session_volume`: Most total work for an exercise in one session

---

### 9. **volumeMetrics**
**Purpose:** Pre-aggregated analytics data
**Owner:** User (1:M)
**Mutability:** Recomputed daily/weekly

**Key Fields:**
- `date` / `weekStartDate`: Time-series grouping
- `totalVolume`: Sum across all exercises
- `volumeByMuscleGroup`: Advanced breakdown

**Why this design:**
- **Performance**: Eliminates expensive aggregations at query time
- **Dashboard speed**: Charts load instantly
- **Batch processing**: Computed via scheduled Convex cron
- **Incremental updates**: Only recalculate changed dates

**Computation strategy:**
```
Daily cron →
  For each user with completed sessions yesterday →
    Aggregate volume by date →
    Upsert volumeMetrics record
```

---

### 10. **aiInteractions**
**Purpose:** Log AI conversations for context and quality
**Owner:** User (1:M)
**Mutability:** Append-only (except `userRating`)

**Key Fields:**
- `type`: Routes to different AI personas (programmer vs. trainer)
- `contextData`: Snapshot of relevant user data
- `userRating`: Feedback for AI quality monitoring

**Why this design:**
- Enables multi-turn conversations (AI sees past exchanges)
- Context snapshots reduce API calls (no need to re-fetch templates)
- Quality tracking informs prompt engineering
- Separates workout generation from coaching advice

---

## Index Strategy

### Primary Indexes (Critical for Performance)

| Table | Index | Rationale |
|-------|-------|-----------|
| `users` | `by_workos_id` | Auth lookups (every request) |
| `workoutTemplates` | `by_user_active` | Template list view (frequent) |
| `workoutSessions` | `by_user_completed` | Timeline queries (dashboard) |
| `sessionExercises` | `by_session_order` | Workout display (ordered) |
| `sets` | `by_session_exercise_set` | Set editing (unique constraint) |
| `personalRecords` | `by_user_exercise_type` | PR lookups (specific checks) |
| `volumeMetrics` | `by_user_date` | Analytics range queries |

### Secondary Indexes (Analytics & Features)

| Table | Index | Use Case |
|-------|-------|----------|
| `sessionExercises` | `by_standardized_exercise` | Cross-session progression tracking |
| `sets` | `by_completed` | Recent activity feeds |
| `aiInteractions` | `by_user_created` | Conversation history |
| `exerciseLibrary` | `by_movement_pattern` | Balanced program generation |

### Composite Indexes Explained

**`by_user_completed` on workoutSessions:**
```typescript
.index("by_user_completed", ["userId", "completedAt"])
```
- Enables: "Get all sessions for user X in date range Y-Z"
- Dashboard analytics depend on this
- Sorted by date automatically

**`by_user_exercise_type` on personalRecords:**
```typescript
.index("by_user_exercise_type", ["userId", "standardizedExerciseId", "recordType"])
```
- Enables: "What's my current 1RM for bench press?"
- Single query retrieves specific PR
- Avoids full table scans

---

## Access Patterns

### 1. **Template Management**
```typescript
// List user's templates
Query: workoutTemplates.by_user_active(userId, true)

// Get template with exercises
Query: workoutTemplates.get(templateId)
Query: templateExercises.by_template_order(templateId)
```

### 2. **Workout Logging**
```typescript
// Start new session
Mutation: workoutSessions.insert({
  userId,
  templateId,
  templateName,
  startedAt: Date.now()
})

// Log a set
Mutation: sets.insert({
  sessionExerciseId,
  setNumber,
  weight,
  reps,
  completedAt: Date.now()
})
```

### 3. **Analytics Queries**
```typescript
// Get volume over time
Query: volumeMetrics.by_user_date(userId)
  .filter(m => m.date >= startDate && m.date <= endDate)

// Exercise progression
Query: sessionExercises.by_standardized_exercise(exerciseId)
  .filter(se => se.userId === userId)
  .map(se => sets.by_session_exercise(se._id))
```

### 4. **AI Context Injection**
```typescript
// Fetch context for AI
Query: workoutTemplates.by_user_active(userId, true)
Query: workoutSessions.by_user_completed(userId)
  .filter(s => s.completedAt > last30Days)
Query: volumeMetrics.by_user_date(userId)
  .filter(m => m.date >= last90Days)
```

---

## Design Decisions

### 1. **Denormalization Strategy**

**What we denormalize:**
- `templateName` in `workoutSessions`
- `exerciseName` in `sessionExercises`

**Why:**
- Templates can be renamed/deleted → history must remain accurate
- Exercises can be renamed → session logs must preserve original names

**Trade-off:**
- Storage: +5-10% data size
- Benefit: 100% historical accuracy, zero JOIN queries

### 2. **Optional Standardization**

**Why `standardizedExerciseId` is optional:**
- Users can log freeform exercises without blocking
- Gradual normalization as AI learns user's naming patterns
- Custom exercises don't force awkward fits

**Strategy:**
- Mutation layer attempts fuzzy matching on insert
- User can manually map if AI misses
- Analytics still work with null IDs (falls back to exerciseName)

### 3. **Pre-computed Metrics**

**Why `totalVolume` lives in `workoutSessions`:**
- Dashboard cards need "Total Volume: 45,000 lbs"
- Computing on-demand = expensive aggregation × N sessions
- Pre-compute on session completion = O(1) dashboard load

**When to compute:**
- On `workoutSessions.update({ completedAt })`
- Sum all sets where `isWarmup = false`

### 4. **Immutable Logs**

**Why sessions/exercises/sets are append-only:**
- Prevents accidental PR invalidation
- Enables "undo" feature (just mark invalid)
- Audit trail for debugging
- Accurate trend analysis

**How to handle mistakes:**
- Add `isInvalid` flag (not shown in analytics)
- Or create correction entry with notes

### 5. **Time-series Optimization**

**Why `volumeMetrics` table exists:**
- Line charts require aggregations across hundreds of sessions
- Real-time computation = 500ms+ query time
- Pre-aggregation = 10ms query time

**Computation frequency:**
- Daily cron for completed sessions
- On-demand for current week (small dataset)

---

## Analytics Optimization

### Volume Tracking
**Requirement:** Show total volume over 7d/30d/90d/all-time

**Implementation:**
```typescript
// Fast path: Pre-aggregated metrics
const metrics = await ctx.db
  .query("volumeMetrics")
  .withIndex("by_user_date", q =>
    q.eq("userId", userId)
     .gte("date", startDate)
     .lte("date", endDate)
  )
  .collect();

const totalVolume = metrics.reduce((sum, m) => sum + m.totalVolume, 0);
```

### Plateau Detection
**Requirement:** Identify when lifts aren't progressing

**Algorithm:**
1. Get last N sessions for an exercise
2. Extract max weight per session
3. Check if flat-lined for X weeks
4. Flag for user/AI attention

**Query:**
```typescript
const recentSessions = await ctx.db
  .query("sessionExercises")
  .withIndex("by_standardized_exercise", q => q.eq("standardizedExerciseId", exerciseId))
  .filter(q => q.eq(q.field("userId"), userId))
  .order("desc")
  .take(10);

// Analyze max weights for stagnation
```

### Muscle Group Balance
**Requirement:** Detect if user is neglecting muscle groups

**Implementation:**
```typescript
const last30Days = await ctx.db
  .query("volumeMetrics")
  .withIndex("by_user_date", q => q.eq("userId", userId).gte("date", thirtyDaysAgo))
  .collect();

const muscleGroupVolumes = last30Days.reduce((acc, day) => {
  Object.entries(day.volumeByMuscleGroup).forEach(([muscle, vol]) => {
    acc[muscle] = (acc[muscle] || 0) + vol;
  });
  return acc;
}, {});

// Alert if push:pull ratio > 1.5:1
```

---

## AI Integration Points

### 1. **Workout Programmer**
**Input context:**
- User's experience level
- Current templates (if any)
- Recent session frequency
- Equipment preferences

**Gemini prompt structure:**
```typescript
const context = {
  experienceLevel: user.experienceLevel,
  currentTemplates: templates.map(t => ({
    name: t.name,
    exercises: exercises.map(e => e.exerciseName)
  })),
  weeklySessionCount: recentSessions.length / 4, // Last 4 weeks
};

const prompt = `
You are a professional strength coach. Design a ${programType} program for a ${context.experienceLevel} lifter.

Current training:
${JSON.stringify(context.currentTemplates, null, 2)}

Requirements: ${userRequirements}
`;
```

### 2. **Training Coach**
**Input context:**
- Recent sessions with RPE/RIR data
- Plateau detection results
- PR history

**Example query:**
```typescript
// User: "Why is my bench press stalling?"
const benchData = await getBenchPressProgression(userId);
const recentRPE = benchData.flatMap(s => s.sets).map(set => set.rpe);

const prompt = `
User's bench press data:
- Last 6 sessions: ${benchData.map(s => `${s.weight}lbs × ${s.reps}`).join(", ")}
- RPE trend: ${recentRPE.join(", ")}
- No PR in 8 weeks

Diagnose likely issue and suggest programming changes.
`;
```

### 3. **Context Snapshots**
Store in `aiInteractions.contextData` for:
- Reproducible debugging
- Follow-up conversations
- Quality analysis

---

## Future Extensibility

### Planned Features

**1. Supersets/Circuits**
Add to `templateExercises`:
```typescript
supersetGroup: v.optional(v.string()), // "A", "B", etc.
supersetType: v.optional(v.union(
  v.literal("superset"),
  v.literal("circuit"),
  v.literal("giant_set")
)),
```

**2. Periodization**
Add to `workoutTemplates`:
```typescript
mesocyclePhase: v.optional(v.union(
  v.literal("accumulation"),
  v.literal("intensification"),
  v.literal("realization"),
  v.literal("deload")
)),
weekNumber: v.optional(v.number()),
```

**3. Video Form Checks**
New table:
```typescript
formVideos: defineTable({
  sessionExerciseId: v.id("sessionExercises"),
  videoUrl: v.string(),
  aiFormAnalysis: v.optional(v.string()),
  userNotes: v.optional(v.string()),
}),
```

**4. Training Partnerships**
New table:
```typescript
trainingPartners: defineTable({
  userId: v.id("users"),
  partnerId: v.id("users"),
  sharedTemplates: v.array(v.id("workoutTemplates")),
}),
```

### Schema Migration Strategy
- Convex supports backward-compatible schema changes
- New fields added as `v.optional()`
- Backfill via mutations if needed
- Indexes added without downtime

---

## Assumptions

1. **Single currency for weights:** Users cannot mix kg/lbs within a session (global preference)
2. **No mid-session template changes:** Session references original template at creation time
3. **Exercise library pre-seeded:** Admin populates standard exercises before user onboarding
4. **Volume = weight × reps:** Standard formula (not accounting for tempo, eccentrics, etc.)
5. **1RM estimation:** Using Epley formula `1RM = weight × (1 + reps/30)`
6. **Plateau threshold:** 3+ weeks with no weight/rep increase
7. **Beginner → Intermediate:** After 6 months or when linear progression stalls
8. **Intermediate → Advanced:** After 2 years or requires periodization

---

## Performance Benchmarks (Estimated)

| Query | Expected Latency | Optimization |
|-------|------------------|--------------|
| Load dashboard | <100ms | Pre-computed volumeMetrics |
| Start workout | <50ms | Single insert + template lookup |
| Log a set | <30ms | Single insert + potential PR check |
| Exercise progression | <200ms | Indexed by standardized exercise |
| AI context fetch | <150ms | Parallel queries for templates/sessions/metrics |
| Generate 12-week program | <3s | Gemini API call (external) |

---

## Conclusion

This architecture balances:
- **Flexibility:** Users can log freeform exercises
- **Structure:** Standardization enables powerful analytics
- **Performance:** Strategic denormalization and pre-computation
- **Scalability:** Indexes support growth to millions of sessions
- **Intelligence:** Rich context for AI-driven coaching

The schema is production-ready and extensible for future features while maintaining clean separation of concerns.
