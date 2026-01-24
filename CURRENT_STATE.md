# Current Application State - YC Here I Come Fitness App

**Last Updated:** January 24, 2026  
**Status:** ✅ Intelligent Training Features Complete - Active Coaching Platform Shipped

---

## 🎯 **Application Overview**

A modern, athletic-themed fitness tracking web app built with:
- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** Convex (real-time database & mutations)
- **Auth:** WorkOS
- **Styling:** Athletic brutalist design with lime-400 accent colors

---

## 📊 **Current Feature Set**

### ✅ **Core Features (Fully Functional)**

#### 1. **Workout Templates**
- Create custom workout templates with name, description, and category
- Add exercises with target sets, reps (min-max range), and rest periods
- **Drag-to-reorder exercises** (via grip handle only)
- **Edit exercises** inline (all parameters editable)
- **Delete exercises** with confirmation
- **Duplicate templates** (one-click copy with all exercises)
- **Delete templates** (soft delete, preserves historical data)
- Smart default values (3 sets, 8-12 reps, 90s rest)

#### 2. **Exercise Library (471 Exercises from Kaggle)**
- ✅ **Standardized exercise database** with:
  - Name, aliases, category (compound/isolation)
  - Movement patterns (horizontal_push, vertical_pull, squat, hinge, etc.)
  - Muscle groups targeted
  - Equipment type (barbell, dumbbell, machine, cable, bodyweight, other)
  - 1RM tracking flags
  - Images (when available)
  - Video URLs (when available)

#### 3. **Smart Exercise Search**
- **Autocomplete dropdown** with real-time search
- **Popular exercises** shown on empty search
- **Recent exercises** tracked (last 8, stored in localStorage)
- **Keyboard navigation** (↑↓ arrows, Enter to select, Escape to close)
- **Exercise images** in dropdown results
- **Visual highlighting** for selected item
- **Verified badge** for standardized exercises
- **Fallback to custom exercises** if not found in library

#### 4. **Exercise Details Modal**
- Click ℹ️ icon on verified exercises
- Shows: category, equipment, movement pattern
- Displays: target muscles, aliases, 1RM tracking status
- Available in both template list and detail views

#### 5. **Smart Defaults Based on Exercise Type**
- **Compound exercises:** 4 sets × 5-8 reps × 180s rest
- **Isolation exercises:** 3 sets × 8-12 reps × 90s rest
- Auto-fills when selecting from library

#### 6. **Active Workout Session**
- Start workout from template
- Log sets with weight and reps
- **Warmup toggle** (excluded from progress calculations)
- **Rest timer** with progress bar (uses template rest periods)
- **Skip rest timer** button
- **PR detection & celebration** with fireworks animation
- Real-time progress tracking (Set X of Y)
- Exercise navigation
- Session completion

#### 7. **Personal Records (PR) Tracking**
- **Estimated 1RM calculation** (Brzycki formula)
- Automatic PR detection on set completion
- PR celebration with trophy icon + fireworks
- PRs tracked by:
  - Standardized exercise ID (when available)
  - Exercise name fallback (case-insensitive)
- Historical PR tracking with `isCurrent` flag

#### 8. **Dashboard**
- Recent workouts (capped at 5 most recent)
- Workout history with expandable details
- PR indicators (trophy icons)
- Total volume, sets, reps per session
- Filters out warmup sets from totals

#### 9. **UI/UX Enhancements**
- ✅ **Toast notifications** (success/error feedback)
- ✅ **Loading states** on all buttons
- ✅ **Mobile-optimized touch targets** (48×48px minimum)
- ✅ **Exercise usage badges** ("In template Xx")
- ✅ **Proper z-index layering** for all modals
- ✅ **Drag-only-from-grip** to prevent accidental drags
- ✅ **Recent exercises tracking** (localStorage)
- ✅ **Keyboard shortcuts** for search

#### 10. **AI Dual-Mode Coaching System (NEW!)** ✨

**Programmer Mode** (Template Generation):
- ✅ **Gemini API Integration** (gemini-3-flash-preview)
- ✅ **Conversational chat interface** with message history
- ✅ **Context-aware responses** (reads user's experience, templates, recent workouts)
- ✅ **Clarifying questions** when user input is incomplete
- ✅ **Full template generation** with exercises, sets, reps, rest times
- ✅ **Fitness programming best practices** (progressive overload, volume landmarks, rep ranges)
- ✅ **Structured output validation** with JSON schema
- ✅ **Safe fallbacks** for malformed AI responses
- ✅ **Automatic template creation** saved directly to user account
- ✅ **Exercise matching** to standardized library
- ✅ **Streaming responses** with JSON parsing

**Trainer Mode** (Technique & Advice):
- ✅ **Automatic intent detection** (question vs program request)
- ✅ **Enhanced training context** (recent performance, training frequency, volume stats)
- ✅ **Movement-specific questions** answered with precise cues
- ✅ **Plateau diagnosis** based on actual training data
- ✅ **Target muscle breakdowns** (primary and secondary)
- ✅ **Technique fixes** with actionable cues
- ✅ **Common mistakes** highlighted
- ✅ **Progression tips** for improvement
- ✅ **Resource recommendations** (YouTube channels, article topics)
- ✅ **Evidence-based advice** (concise, practical, biomechanics-focused)
- ✅ **Streaming text responses** with real-time display

**Shared Features**:
- ✅ **Conversation history** logged in database (programmer vs trainer type)
- ✅ **Quick suggestion buttons** for both question and program types
- ✅ **Debug mode toggle** to view raw API responses
- ✅ **Real-time loading states** and error handling
- ✅ **Mobile-optimized** responsive design

#### 11. **Analytics Dashboard (NEW!)** 📊

**Volume Tracking**:
- ✅ **Volume over time chart** with daily tracking and configurable time ranges
- ✅ **Total volume stats** with averages per workout
- ✅ **Time range filters** (7d, 30d, 90d, 1y) with instant updates

**Exercise Progression**:
- ✅ **Exercise-specific progression charts** tracking max weight, estimated 1RM, and volume
- ✅ **1RM calculator** using Epley formula: weight × (1 + reps/30)
- ✅ **Multi-metric visualization** (max weight, est. 1RM, volume in single chart)
- ✅ **Exercise selector** to view any logged exercise's progression

**Personal Records**:
- ✅ **Recent PRs list** with exercise names, weights, and dates
- ✅ **Record type badges** (max weight, volume PR)
- ✅ **PR count stats** for selected time period

**Plateau Detection**:
- ✅ **Automatic plateau identification** (less than 2.5% improvement over 3+ sessions)
- ✅ **Per-exercise analysis** with session count and improvement percentage
- ✅ **Date range tracking** showing first and last session in plateau
- ✅ **Visual alerts** with yellow badges for plateaued exercises

**Summary Stats**:
- ✅ **Total volume** (lbs lifted) for selected period
- ✅ **Total workouts** completed
- ✅ **Total sets** logged
- ✅ **PRs achieved** in time range

**Design & Performance**:
- ✅ **Recharts integration** for clean, responsive visualizations
- ✅ **Mobile-first design** with adaptive layouts
- ✅ **Performant Convex queries** with indexed lookups
- ✅ **Real-time updates** as new workouts are logged
- ✅ **Metrics explanations** panel for user education

#### 12. **Settings & Profile Management (NEW!)** ⚙️

**Profile Settings**:
- ✅ **Name editing** with real-time updates
- ✅ **Email display** (read-only, managed by WorkOS)
- ✅ **Account information** showing member since date and last update

**Training Profile**:
- ✅ **Experience level selector** (Beginner, Intermediate, Advanced)
- ✅ **Visual cards** with training years for each level
- ✅ **Real-time updates** affecting AI recommendations

**Preferences**:
- ✅ **Weight unit toggle** (lbs/kg) affecting all weight displays
- ✅ **Default rest time selector** (60s, 90s, 120s, 180s)
- ✅ **Visual time display** (MM:SS format)
- ✅ **Instant save** with success feedback

**UX Features**:
- ✅ **Save button** at top and bottom (mobile-friendly)
- ✅ **Success indicator** with checkmark animation
- ✅ **Loading states** during save operations
- ✅ **Responsive design** with mobile-first approach
- ✅ **Clear section organization** with icons

#### 13. **Intelligent Training Features (NEW!)** 🧠

**Auto-Progression System**:
- ✅ **Double progression logic** (reps → weight → deload)
- ✅ **Confidence scoring** (0-100%) based on data quality
- ✅ **Last session comparison** showing previous performance
- ✅ **Actionable suggestions** (increase weight, increase reps, maintain, deload)
- ✅ **Integrated into workout-active** page before first set

**Progressive Overload Indicators**:
- ✅ **Real-time performance feedback** (improved/declined/maintained)
- ✅ **Percentage improvement** based on estimated 1RM (Epley formula)
- ✅ **Progression streak counter** (consecutive improvements)
- ✅ **Visual badges** with color coding (green=improved, red=declined, yellow=maintained)
- ✅ **Lightning bolt icon** for active streaks

**Exercise Substitutions**:
- ✅ **AI-powered alternatives** using Gemini API
- ✅ **Muscle group matching** to ensure equivalent stimulus
- ✅ **Equipment-based filtering** (barbell, dumbbell, machine, cable, bodyweight)
- ✅ **Difficulty ratings** (easier, similar, harder)
- ✅ **Contextual reasoning** explaining why each substitution works

**Recovery & Fatigue Monitoring**:
- ✅ **Readiness score (0-100)** based on multiple factors
- ✅ **Volume change tracking** (7-day rolling comparison)
- ✅ **Training frequency analysis** (weekly workout count)
- ✅ **Rest day optimization** (ideal: 2-3 days between sessions)
- ✅ **PR performance correlation** (indicates good recovery)
- ✅ **Fatigue level indicators** (low, moderate, high, critical)
- ✅ **Actionable recommendations** (deload suggestions, volume adjustments)
- ✅ **Detailed metrics dashboard** (current vs previous week)
- ✅ **Status classification** (excellent, good, moderate, poor, critical)

**Technical Implementation**:
- ✅ **Convex queries** (`progression.ts`, `recovery.ts`)
- ✅ **UI components** (ProgressionBadge, ProgressionSuggestion, RecoveryWidget)
- ✅ **Epley 1RM formula** for strength estimation
- ✅ **Multi-factor scoring algorithm** for recovery calculation
- ✅ **Integrated with workout-active page** for real-time suggestions
- ✅ **Integrated with analytics dashboard** for recovery monitoring

---

## 🗂️ **Key Files & Structure**

### **Frontend Pages**
```
src/app/(app)/
├── dashboard/page.tsx          # Dashboard with recent workouts
├── workouts/page.tsx           # Template management (1207 lines)
│   ├── Template list view
│   ├── Template detail/editor view
│   ├── Exercise search & autocomplete
│   ├── Drag-to-reorder (grip handle)
│   ├── Add/Edit/Delete exercise modals
│   ├── Exercise details modal
│   └── Duplicate template
├── workout-active/page.tsx     # Active session tracking
│   ├── Set logging
│   ├── Rest timer with skip
│   ├── Warmup toggle
│   ├── PR celebration + fireworks
│   └── Exercise navigation
├── analytics/page.tsx          # Analytics dashboard (NEW!)
│   ├── Volume over time chart
│   ├── Exercise progression tracking
│   ├── Personal records list
│   ├── Plateau detection
│   └── Time range filters
├── ai/page.tsx                 # AI Coach (NEW!)
│   ├── Dual-mode chat interface
│   ├── Programmer mode (template generation)
│   ├── Trainer mode (technique advice)
│   └── Streaming responses
└── settings/page.tsx           # Settings & Profile (NEW!)
    ├── Profile information
    ├── Experience level selector
    ├── Weight unit and rest time preferences
    └── Account information
```

### **Convex Backend**
```
convex/
├── schema.ts                   # Database schema (349 lines)
│   ├── users, workoutTemplates, templateExercises
│   ├── workoutSessions, sessionExercises, sets
│   ├── exerciseLibrary (with imageUrl, videoUrl)
│   ├── personalRecords, volumeMetrics
│   └── aiInteractions
├── templates.ts                # Template CRUD (239 lines)
│   ├── createTemplate, getUserTemplates
│   ├── addExerciseToTemplate (with standardizedExerciseId)
│   ├── updateTemplateExercise, removeExerciseFromTemplate
│   ├── reorderTemplateExercises, deleteTemplate
│   └── duplicateTemplate (NEW)
├── sessions.ts                 # Session & set logging (403 lines)
│   ├── startSession, completeSession, cancelSession
│   ├── logSet (returns { setId, isPR })
│   ├── getActiveSession (with template data joined)
│   └── PR tracking (by ID or name fallback)
├── exercises.ts                # Exercise library (278 lines)
│   ├── seedExercises (imports Kaggle dataset)
│   ├── searchExercises (fuzzy search)
│   ├── getExercise, getExercisesByMuscleGroup
│   └── getPopularExercises (NEW)
├── analytics.ts                # Analytics queries (NEW!)
│   ├── getVolumeOverTime (daily volume for time range)
│   ├── getExerciseProgression (max weight, 1RM, volume)
│   ├── getUserExercises (all logged exercises)
│   ├── getPersonalRecords (recent PRs)
│   ├── detectPlateaus (< 2.5% improvement detection)
│   └── getDashboardStats (summary metrics)
└── ai.ts                       # AI integration (NEW!)
    ├── saveInteraction (log conversations)
    ├── getConversationHistory
    ├── createTemplatesFromAI (save AI-generated templates)
    ├── findStandardizedExercise (fuzzy matching)
    ├── getUserContextForAI (programmer context)
    └── getTrainingContextForAI (trainer context)
```

### **Data Files**
```
convex/data/
├── exercises.json              # 471 exercises from Kaggle
└── README.md                   # Dataset documentation

Root:
├── convert_exercises.py        # Excel → JSON converter
├── Gym Exercises Dataset.xlsx  # Source data (gitignored)
└── gym-exercises-dataset.zip   # Downloaded archive (gitignored)
```

---

## 🎨 **Design System**

### **Colors**
- Primary: `lime-400` (#a3e635)
- Background: `black` / `zinc-900` / `zinc-950`
- Text: `white` / `zinc-400` / `zinc-500`
- Error: `red-400` / `red-500`
- Info: `blue-400`

### **Typography**
- Titles: `Bebas Neue` (athletic-title class)
- Body: `Roboto Condensed` (athletic-body class)

### **UI Patterns**
- **Clipped corners** (`.clip-corner`, `.clip-corner-bottom`)
- **Pulse glow** on CTAs
- **Athletic brutalist** aesthetic
- **Mobile-first** responsive design

### **Z-Index Hierarchy**
1. Base content: `z-0`
2. Primary modals: `z-[60]` (Add/Edit/Create)
3. Secondary modals: `z-[70]` (Exercise details)
4. Toast notifications: `z-[80]`

---

## 🔧 **Technical Implementation Details**

### **Exercise Library Integration**
- **Dataset:** Kaggle Gym Exercises (471 exercises)
- **Import Process:**
  1. Download Excel file
  2. Convert with `convert_exercises.py` (handles NaN values)
  3. Output to `convex/data/exercises.json`
  4. Seed with `npx convex run exercises:seedExercises`

### **Smart Defaults Logic**
```typescript
// Compound: heavier, fewer reps, more rest
if (exercise.category === "compound") {
  return { sets: 4, repsMin: 5, repsMax: 8, rest: 180 };
}
// Isolation: moderate weight, more reps, less rest
return { sets: 3, repsMin: 8, repsMax: 12, rest: 90 };
```

### **PR Tracking Logic**
1. Calculate estimated 1RM: `weight / (1.0278 - 0.0278 × reps)`
2. Find current PR by:
   - `standardizedExerciseId` (if available)
   - `exerciseName` (case-insensitive fallback)
3. Compare and update if new PR
4. Return `isPR` flag to frontend for immediate celebration

### **Keyboard Navigation**
- `↓` - Next item in dropdown
- `↑` - Previous item
- `Enter` - Select highlighted item
- `Escape` - Close dropdown

### **Recent Exercises**
- Stored in `localStorage` as JSON array
- Tracks last 8 exercises added
- Deduplicates by name
- Shows in dropdown when search is empty

---

## 📝 **Data Models**

### **exerciseLibrary**
```typescript
{
  _id: Id<"exerciseLibrary">,
  name: string,                    // "Barbell Bench Press"
  aliases: string[],               // ["bench", "bb bench", "bp"]
  category: "compound" | "isolation",
  movementPattern: "horizontal_push" | "vertical_push" | ...,
  muscleGroups: string[],          // ["Chest", "Triceps"]
  equipmentType: "barbell" | "dumbbell" | ...,
  is1RMTracked: boolean,
  imageUrl?: string,               // Optional thumbnail
  videoUrl?: string,               // Optional demo video
  createdAt: number
}
```

### **templateExercises**
```typescript
{
  _id: Id<"templateExercises">,
  templateId: Id<"workoutTemplates">,
  exerciseName: string,
  standardizedExerciseId?: Id<"exerciseLibrary">,  // Links to library
  orderIndex: number,
  targetSets?: number,
  targetRepsMin?: number,
  targetRepsMax?: number,
  restSeconds?: number,
  targetWeight?: number,
  targetWeightPercent1RM?: number,
  targetRPE?: number,
  targetRIR?: number,
  notes?: string,
  createdAt: number
}
```

### **sets**
```typescript
{
  _id: Id<"sets">,
  sessionExerciseId: Id<"sessionExercises">,
  setNumber: number,
  weight: number,
  reps: number,
  rpe?: number,
  rir?: number,
  isWarmup: boolean,               // Excluded from progress/PRs
  isPR: boolean,                   // Auto-flagged on insert
  completedAt: number,
  notes?: string
}
```

---

## 🚀 **Recent Enhancements (Last Session)**

### **Completed Features**
1. ✅ Loading & success states (toasts, spinners)
2. ✅ Popular exercises on empty search
3. ✅ Keyboard navigation (arrows, enter, esc)
4. ✅ Smart defaults based on exercise category
5. ✅ Recent exercises tracking (localStorage)
6. ✅ Exercise details modal with full info
7. ✅ Exercise usage stats ("In template Xx")
8. ✅ Duplicate template button
9. ✅ Better mobile touch targets (48×48px)
10. ✅ Exercise images in dropdown

### **Bug Fixes**
- ✅ Fixed draggable interfering with buttons (moved to grip only)
- ✅ Fixed modal z-index layering
- ✅ Fixed exercise details modal not appearing in template detail view
- ✅ Added loading state to exercise details modal
- ✅ Fixed search dropdown click-outside behavior

---

## 🎯 **Known Limitations & Future Considerations**

### **Current Limitations**
1. **No video playback** - Only stores URLs, doesn't embed
2. **No exercise filtering** - By muscle group or equipment (query exists, UI doesn't)
3. **No exercise preview** - In search results beyond thumbnail
4. **No template sharing** - Templates are user-specific
5. **No rest timer audio** - Silent timer only

### **Exercise Library Gaps**
- Some exercises missing images/videos (depends on dataset)
- No custom exercise library (users can only add to templates)
- No exercise favorites/bookmarks
- No exercise recommendations

### **Potential Next Features**
- 🎥 Exercise video player in details modal
- 🔍 Advanced exercise filtering (muscle group, equipment, 1RM tracked)
- 🔔 Rest timer audio alerts
- 💾 Template import/export
- 👥 Social features (share templates, follow friends)
- 📱 PWA/mobile app optimization
- 🎨 Theme customization
- 📅 Workout scheduling & calendar view
- 🏆 Achievement system & badges

---

## 🛠️ **Development Commands**

```bash
# Start development
npm run dev           # Next.js dev server
npx convex dev        # Convex backend (watch mode)

# Deploy
npx convex deploy     # Deploy Convex functions

# Database operations
npx convex run exercises:seedExercises  # Seed exercise library

# Data conversion
python convert_exercises.py  # Convert Excel → JSON
```

---

## 📂 **Important Files for Claude Code**

### **Must Read First**
1. `CURRENT_STATE.md` - This file (you are here)
2. `convex/schema.ts` - Complete data model
3. `src/app/(app)/workouts/page.tsx` - Main template editor

### **Additional Context**
4. `EXERCISE_LIBRARY_INTEGRATION.md` - Exercise library setup guide
5. `FIXES_APPLIED.md` - Historical bug fixes
6. `WORKOUT_FEATURES.md` - Original feature spec

### **Backend Logic**
7. `convex/sessions.ts` - Session & PR tracking logic
8. `convex/templates.ts` - Template CRUD operations
9. `convex/exercises.ts` - Exercise library queries

---

## 🎉 **Current Status: Production Ready**

The application is **feature-complete** with **active coaching intelligence**:
- ✅ Create templates with exercises
- ✅ Start and log workouts with auto-progression suggestions
- ✅ Track PRs automatically with overload indicators
- ✅ View workout history with progression streaks
- ✅ Dual-mode AI coaching (programmer + trainer + substitutions)
- ✅ Analytics dashboard with progression tracking & recovery monitoring
- ✅ Plateau detection with actionable recommendations
- ✅ Settings & profile management
- ✅ Intuitive UX with modern features
- ✅ **Auto-progression system** (tells you when to add weight)
- ✅ **Recovery & fatigue monitoring** (prevents overtraining)
- ✅ **Progressive overload indicators** (real-time feedback)
- ✅ **Exercise substitutions** (AI-powered alternatives)

**Recommended Next Steps:**
1. User testing & feedback collection
2. Performance optimization (if needed)
3. Exercise video integration
4. Advanced filtering & search features

---

**End of Current State Document**

