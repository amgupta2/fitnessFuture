# 🧠 Intelligent Training Features

## Overview

This document describes the four advanced features that make this platform an **active training partner**, not just a passive tracker:

1. **Auto-Progression System** - AI-powered weight/rep recommendations
2. **Progressive Overload Indicators** - Real-time performance feedback
3. **Exercise Substitutions** - AI-suggested alternatives
4. **Recovery & Fatigue Monitoring** - Readiness scoring and overtrain detection

---

## 1. Auto-Progression System 🎯

### What It Does
Analyzes your last 2-3 sessions for each exercise and suggests actionable next steps using **double progression** principles.

### How It Works

**Double Progression Logic:**
1. **Increase Reps**: If you're within target range but not at the top
2. **Increase Weight**: When you consistently hit the top of the rep range
3. **Maintain**: When making steady progress
4. **Deload**: When performance drops >5%

**Confidence Scoring:**
- 85%+: High confidence (clear progression pattern)
- 60-84%: Moderate confidence (some variability)
- <60%: Low confidence (inconsistent data)

### Where You See It
- **Workout Active Page**: Before your first set of each exercise
- Shows suggested weight, target reps, and reasoning
- Displays last session's performance for reference

### Example Suggestions

```
✅ Ready to Progress!
"You hit 12+ reps on all sets. Time to add weight!"
Suggested Weight: 230 lbs
Target Reps: 8-12
Confidence: 85%
```

```
📈 Build Volume
"Aim for 10-12 reps to build up to a weight increase."
Current Weight: 225 lbs
Target Reps: 10-12
Confidence: 70%
```

```
⚠️ Deload Recommended
"Performance dropped 8%. Consider a deload week."
Suggested Weight: 205 lbs (10% reduction)
Target Reps: 8-12
Confidence: 75%
```

---

## 2. Progressive Overload Indicators 📊

### What It Does
Provides instant visual feedback on whether you beat, maintained, or fell behind your previous performance.

### Components

**ProgressionBadge**
- Green (+X%): You improved
- Red (-X%): Performance declined  
- Yellow (Maintained): Same as last time
- Blue streak: Consecutive improvements

**Progression Streak**
- Tracks how many sessions in a row you've improved
- Displayed as a lightning bolt icon
- Example: "⚡ 5 streak" = 5 consecutive improvements

### Where You See It
- **Workout Active Page**: Next to exercise name
- **Analytics Dashboard**: On charts showing progression

### Calculation
Uses **Estimated 1RM** (Epley formula) to compare sessions:
```
1RM = weight × (1 + reps/30)
```

Example:
- Last session: 225 lbs × 10 reps = 300 lbs 1RM
- This session: 225 lbs × 11 reps = 308 lbs 1RM
- Improvement: +2.7% ✅

---

## 3. Exercise Substitutions 🔄

### What It Does
Uses AI to suggest alternative exercises when you need to substitute due to:
- Equipment unavailability
- Injury/pain
- Preference
- Gym crowding

### How It Works

**AI Analysis:**
1. Identifies primary muscle groups
2. Matches movement patterns
3. Considers available equipment
4. Suggests easier, similar, and harder alternatives

### Example Output

```
Replace: Barbell Bench Press
Available: Dumbbells, cables, machines

Suggestions:
1. Dumbbell Bench Press (Similar difficulty)
   "Targets same muscles, allows greater ROM"

2. Machine Chest Press (Easier)
   "Stable movement, good for fatigue management"

3. Dips (Harder)
   "Bodyweight compound, increases stabilizer demand"
```

### Where to Use It
**Coming Soon**: Integrated into template editor and workout-active page with a "Substitute Exercise" button.

**Current Access**: Via AI Coach - ask: "What can I substitute for [exercise]?"

---

## 4. Recovery & Fatigue Monitoring ⚡

### What It Does
Calculates a **Readiness Score (0-100)** based on multiple factors to prevent overtraining and optimize performance.

### Scoring Factors

| Factor | Impact | Details |
|--------|--------|---------|
| **Volume Change** | -20 to +10 | Large spikes hurt recovery |
| **Training Frequency** | -15 to +15 | 6+ sessions/week increases fatigue |
| **Rest Days** | -10 to +10 | 2-3 days rest is optimal |
| **PR Performance** | -5 to +10 | PRs indicate good recovery |
| **Consistency** | -10 | Large fluctuations hurt |

### Score Interpretation

| Score | Status | Meaning |
|-------|--------|---------|
| 85-100 | Excellent | Well-rested, ready for intensity |
| 70-84 | Good | Continue training as planned |
| 50-69 | Moderate | Monitor closely, avoid spikes |
| 30-49 | Poor | Consider deload |
| 0-29 | Critical | **Mandatory deload week** |

### Fatigue Levels
- **Low**: Normal training recommended
- **Moderate**: Watch volume increases
- **High**: Avoid hard training
- **Critical**: Rest or active recovery only

### Recommendations

The system provides actionable advice:
- "⚠️ Consider a deload week (50-60% volume)"
- "Volume increased significantly. Monitor recovery."
- "Well-rested. Good time for hard training."
- "High training frequency. Consider rest days."

### Where You See It
- **Analytics Dashboard**: Full recovery widget with metrics
- **Dashboard (Coming Soon)**: Quick readiness score card

---

## Technical Implementation

### Convex Queries

**`convex/progression.ts`**
- `getProgressionSuggestion`: Analyzes history, returns suggestion
- `getOverloadIndicator`: Compares current set to previous
- `getProgressionStreak`: Counts consecutive improvements

**`convex/recovery.ts`**
- `getRecoveryScore`: Calculates readiness (0-100)
- `getMuscleGroupFatigue`: Tracks volume by muscle
- `needsDeload`: Binary deload recommendation

### UI Components

**`src/components/workout/`**
- `ProgressionSuggestion`: Displays weight/rep recommendations
- `ProgressionBadge`: Shows improvement indicators

**`src/components/analytics/`**
- `RecoveryWidget`: Full recovery dashboard

### AI Integration

**`src/lib/gemini.ts`**
- `generateExerciseSubstitutions`: AI-powered alternatives

---

## Usage Guide

### For Users

**Before Your Workout:**
1. Check **Analytics** for recovery score
2. If score < 50, consider lighter session

**During Your Workout:**
1. Read progression suggestion before first set
2. Follow recommended weight/reps
3. Watch for overload indicators after each set

**After Your Workout:**
1. Review streak progress
2. Check if plateau detected (Analytics)
3. Adjust next week if needed

### For Developers

**To Regenerate APIs:**
```bash
npx convex dev
```

**To Test Recovery Score:**
```typescript
const recovery = useQuery(api.recovery.getRecoveryScore, { userId });
console.log(`Readiness: ${recovery.score}/100`);
```

**To Test Progression:**
```typescript
const suggestion = useQuery(api.progression.getProgressionSuggestion, {
  userId,
  exerciseName: "Bench Press",
  targetSets: 3,
  targetRepsMin: 8,
  targetRepsMax: 12
});
```

---

## Best Practices

### Progressive Overload
- **Trust the system**: If it says add weight, you're ready
- **Don't skip steps**: Build reps before adding weight
- **Respect deloads**: -10% for one week, then return stronger

### Recovery Management
- **Score 70+**: Train normally
- **Score 50-69**: Reduce volume 10-20%
- **Score <50**: Deload week (50% volume)
- **Score <30**: Rest days only

### Exercise Substitutions
- **Use similar difficulty first**: Build proficiency
- **Progress to harder variations**: Once confident
- **Track both exercises**: Maintain history

---

## Future Enhancements

### Phase 2 (In Progress)
- [ ] Exercise substitution UI in workout-active
- [ ] Recovery score on dashboard
- [ ] Weekly deload auto-scheduling

### Phase 3 (Planned)
- [ ] Mesocycle planning (4-6 week blocks)
- [ ] Volume landmarks by muscle group
- [ ] RIR/RPE integration
- [ ] Fatigue by muscle group visualization

---

## Troubleshooting

**Q: No progression suggestion showing**
- Need 2-3 previous sessions with that exercise
- Make sure you're logging working sets (not warmups)

**Q: Recovery score seems inaccurate**
- Score updates based on last 7 days
- Needs at least 2 workouts in history

**Q: Streak counter not appearing**
- Requires 2+ consecutive sessions with improvement
- Based on estimated 1RM, not just weight

---

## Scientific References

**Progressive Overload:**
- Schoenfeld, B. J. (2010). "The mechanisms of muscle hypertrophy"
- Double progression: 1-2 reps per week increase

**Recovery:**
- Foster, C. (1998). "Monitoring training in athletes"
- Acute:Chronic Workload Ratio (simplified for gym context)

**Estimated 1RM:**
- Epley Formula: 1RM = weight × (1 + reps/30)
- Accuracy: ±5% for reps 1-10

---

**Last Updated:** January 24, 2026  
**Version:** 1.0

