# AI Workout Programmer - Example Prompts

This document provides example prompts and expected AI responses to help users understand how to interact with the AI workout programmer.

---

## Complete Requests (Generate Templates Immediately)

### Example 1: Push/Pull/Legs Split

**User Prompt:**
```
Create a 6-day Push/Pull/Legs split for an intermediate lifter focusing on hypertrophy. 
I have access to a full gym with barbells, dumbbells, cables, and machines. 
Each session should be 60-75 minutes.
```

**Expected AI Response:**
```json
{
  "needsMoreInfo": false,
  "templates": [
    {
      "name": "Push Day A",
      "description": "Chest and shoulder emphasis with progressive overload",
      "category": "push",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120,
          "notes": "Add 2.5-5lbs when you hit 4x10"
        },
        {
          "name": "Incline Dumbbell Press",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90
        },
        {
          "name": "Cable Flyes",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Overhead Press",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        },
        {
          "name": "Lateral Raises",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Tricep Pushdowns",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        }
      ]
    },
    {
      "name": "Pull Day A",
      "description": "Back and bicep focus with vertical and horizontal pulling",
      "category": "pull",
      "exercises": [
        {
          "name": "Deadlift",
          "sets": 3,
          "repsMin": 6,
          "repsMax": 8,
          "restSeconds": 180,
          "notes": "Heavy compound movement, add 5-10lbs when you hit 3x8"
        },
        {
          "name": "Pull-ups",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120,
          "notes": "Add weight when you can do 4x10 bodyweight"
        },
        {
          "name": "Barbell Row",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        },
        {
          "name": "Face Pulls",
          "sets": 3,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 60,
          "notes": "Focus on rear delts and upper back health"
        },
        {
          "name": "Dumbbell Curl",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 60
        },
        {
          "name": "Hammer Curl",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 60
        }
      ]
    },
    {
      "name": "Leg Day A",
      "description": "Quad-dominant with posterior chain work",
      "category": "legs",
      "exercises": [
        {
          "name": "Barbell Squat",
          "sets": 4,
          "repsMin": 6,
          "repsMax": 8,
          "restSeconds": 180,
          "notes": "Add 5-10lbs when you hit 4x8"
        },
        {
          "name": "Romanian Deadlift",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        },
        {
          "name": "Leg Press",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90
        },
        {
          "name": "Leg Curl",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Calf Raises",
          "sets": 4,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 60
        }
      ]
    }
    // Push Day B, Pull Day B, Leg Day B would also be generated...
  ]
}
```

---

### Example 2: Beginner Full Body

**User Prompt:**
```
I'm a complete beginner who wants to build strength. I can train 3 days per week 
for about 45 minutes per session. I have access to a basic home gym with a barbell, 
bench, and squat rack.
```

**Expected AI Response:**
```json
{
  "needsMoreInfo": false,
  "templates": [
    {
      "name": "Full Body Workout A",
      "description": "Beginner strength program focusing on compound movements",
      "category": "full_body",
      "exercises": [
        {
          "name": "Barbell Squat",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 180,
          "notes": "Focus on form, add weight slowly"
        },
        {
          "name": "Barbell Bench Press",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 180,
          "notes": "Full range of motion, controlled descent"
        },
        {
          "name": "Barbell Row",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120,
          "notes": "Pull to lower chest, squeeze shoulder blades"
        },
        {
          "name": "Overhead Press",
          "sets": 2,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        }
      ]
    },
    {
      "name": "Full Body Workout B",
      "description": "Alternate workout with different movement patterns",
      "category": "full_body",
      "exercises": [
        {
          "name": "Deadlift",
          "sets": 3,
          "repsMin": 6,
          "repsMax": 8,
          "restSeconds": 180,
          "notes": "Master form before adding weight"
        },
        {
          "name": "Barbell Bench Press",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 180
        },
        {
          "name": "Barbell Row",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        },
        {
          "name": "Romanian Deadlift",
          "sets": 2,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90,
          "notes": "Feel the stretch in hamstrings"
        }
      ]
    }
  ]
}
```

---

### Example 3: Upper/Lower Split

**User Prompt:**
```
Create a 4-day upper/lower split for an advanced lifter. Goal is powerlifting strength 
with some hypertrophy. I compete in bench, squat, and deadlift. Full gym access.
```

**Expected AI Response:**
```json
{
  "needsMoreInfo": false,
  "templates": [
    {
      "name": "Upper Body Strength",
      "description": "Heavy bench press focus with supporting movements",
      "category": "upper",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 5,
          "repsMin": 3,
          "repsMax": 5,
          "restSeconds": 300,
          "notes": "Competition bench, work up to heavy triple"
        },
        {
          "name": "Barbell Row",
          "sets": 4,
          "repsMin": 6,
          "repsMax": 8,
          "restSeconds": 180,
          "notes": "Build back strength for bench stability"
        },
        {
          "name": "Overhead Press",
          "sets": 3,
          "repsMin": 6,
          "repsMax": 8,
          "restSeconds": 180
        },
        {
          "name": "Close Grip Bench Press",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120,
          "notes": "Tricep strength for lockout"
        },
        {
          "name": "Face Pulls",
          "sets": 3,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 60,
          "notes": "Shoulder health and rear delt work"
        }
      ]
    },
    {
      "name": "Lower Body Strength",
      "description": "Squat and deadlift focused with accessories",
      "category": "lower",
      "exercises": [
        {
          "name": "Barbell Squat",
          "sets": 5,
          "repsMin": 3,
          "repsMax": 5,
          "restSeconds": 300,
          "notes": "Competition squat, work up to heavy triple"
        },
        {
          "name": "Deadlift",
          "sets": 4,
          "repsMin": 3,
          "repsMax": 5,
          "restSeconds": 300,
          "notes": "Competition deadlift, manage fatigue"
        },
        {
          "name": "Front Squat",
          "sets": 3,
          "repsMin": 6,
          "repsMax": 8,
          "restSeconds": 180,
          "notes": "Quad strength and upper back work"
        },
        {
          "name": "Romanian Deadlift",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120,
          "notes": "Hamstring and glute development"
        },
        {
          "name": "Leg Curl",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60,
          "notes": "Hamstring isolation for injury prevention"
        }
      ]
    },
    {
      "name": "Upper Body Hypertrophy",
      "description": "Volume work for muscle building",
      "category": "upper",
      "exercises": [
        {
          "name": "Incline Barbell Press",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        },
        {
          "name": "Pull-ups",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120,
          "notes": "Add weight if needed"
        },
        {
          "name": "Dumbbell Row",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90
        },
        {
          "name": "Dumbbell Shoulder Press",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90
        },
        {
          "name": "Cable Flyes",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Dumbbell Curl",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 60
        },
        {
          "name": "Tricep Extension",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        }
      ]
    },
    {
      "name": "Lower Body Hypertrophy",
      "description": "Volume leg work for muscle building",
      "category": "lower",
      "exercises": [
        {
          "name": "Leg Press",
          "sets": 4,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90
        },
        {
          "name": "Romanian Deadlift",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        },
        {
          "name": "Bulgarian Split Squat",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90,
          "notes": "Per leg, unilateral work"
        },
        {
          "name": "Leg Curl",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Leg Extension",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Calf Raises",
          "sets": 4,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 60
        }
      ]
    }
  ]
}
```

---

## Incomplete Requests (Needs Clarification)

### Example 4: Vague Goal

**User Prompt:**
```
I want to build muscle
```

**Expected AI Response:**
```json
{
  "needsMoreInfo": true,
  "clarifyingQuestions": [
    "Great goal! To design the perfect muscle-building program, I need to know:",
    "• How many days per week can you train?",
    "• What's your training experience? (beginner/intermediate/advanced)",
    "• Do you have access to a full gym or limited equipment?",
    "• How much time do you have per session?"
  ]
}
```

---

### Example 5: Missing Schedule

**User Prompt:**
```
Create a hypertrophy program for intermediate lifter
```

**Expected AI Response:**
```json
{
  "needsMoreInfo": true,
  "clarifyingQuestions": [
    "I can create a great hypertrophy program for you! Just need a few more details:",
    "• How many days per week can you train? (3, 4, 5, or 6 days?)",
    "• Do you prefer full body, upper/lower, or push/pull/legs split?",
    "• Any equipment limitations or exercises you can't do?"
  ]
}
```

---

### Example 6: Equipment Unclear

**User Prompt:**
```
I'm a beginner and want to train 3 days per week for strength
```

**Expected AI Response:**
```json
{
  "needsMoreInfo": true,
  "clarifyingQuestions": [
    "Perfect! 3 days per week is ideal for beginners. Before I create your program:",
    "• What equipment do you have access to? (full gym, home gym with barbell, dumbbells only, bodyweight only?)",
    "• Any injuries or exercises you need to avoid?",
    "• How much time do you have per session?"
  ]
}
```

---

## Context-Aware Responses

### Example 7: User Already Has Templates

**User Context:**
```typescript
{
  experienceLevel: "intermediate",
  currentTemplates: [
    { name: "Push Day", exercises: ["Bench Press", "Overhead Press", "..."] },
    { name: "Pull Day", exercises: ["Deadlift", "Pull-ups", "..."] }
  ],
  recentWorkouts: [
    { templateName: "Push Day", completedAt: 1234567890 },
    { templateName: "Pull Day", completedAt: 1234567891 },
    // ... 10 more workouts
  ]
}
```

**User Prompt:**
```
I need a leg day to complete my split
```

**Expected AI Response:**
```json
{
  "needsMoreInfo": false,
  "templates": [
    {
      "name": "Leg Day",
      "description": "Complete your push/pull split with comprehensive leg training",
      "category": "legs",
      "exercises": [
        {
          "name": "Barbell Squat",
          "sets": 4,
          "repsMin": 6,
          "repsMax": 8,
          "restSeconds": 180,
          "notes": "Match the intensity of your push/pull days"
        },
        {
          "name": "Romanian Deadlift",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        },
        {
          "name": "Leg Press",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90
        },
        {
          "name": "Leg Curl",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Leg Extension",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Calf Raises",
          "sets": 4,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 60
        }
      ]
    }
  ]
}
```

---

## Special Requests

### Example 8: Home Gym Limitations

**User Prompt:**
```
Create a 4-day upper/lower split for intermediate lifter. I only have dumbbells 
up to 50lbs, a bench, and resistance bands. Goal is hypertrophy.
```

**Expected AI Response:**
```json
{
  "needsMoreInfo": false,
  "templates": [
    {
      "name": "Upper Body A",
      "description": "Dumbbell-focused upper body with high volume",
      "category": "upper",
      "exercises": [
        {
          "name": "Dumbbell Bench Press",
          "sets": 4,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90,
          "notes": "Slow tempo to maximize time under tension"
        },
        {
          "name": "Dumbbell Row",
          "sets": 4,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90
        },
        {
          "name": "Dumbbell Shoulder Press",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Dumbbell Flyes",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Band Pull-Aparts",
          "sets": 3,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 45,
          "notes": "Rear delt and upper back work"
        },
        {
          "name": "Dumbbell Curl",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Dumbbell Tricep Extension",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        }
      ]
    },
    {
      "name": "Lower Body A",
      "description": "Dumbbell leg work with unilateral focus",
      "category": "lower",
      "exercises": [
        {
          "name": "Dumbbell Goblet Squat",
          "sets": 4,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 90,
          "notes": "Pause at bottom for extra quad work"
        },
        {
          "name": "Dumbbell Romanian Deadlift",
          "sets": 4,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90
        },
        {
          "name": "Dumbbell Bulgarian Split Squat",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60,
          "notes": "Per leg"
        },
        {
          "name": "Dumbbell Lunge",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60,
          "notes": "Per leg, walking or stationary"
        },
        {
          "name": "Dumbbell Calf Raises",
          "sets": 4,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 45,
          "notes": "Stand on step for full ROM"
        }
      ]
    }
    // Upper B and Lower B would also be generated...
  ]
}
```

---

### Example 9: Injury Accommodation

**User Prompt:**
```
I'm intermediate, want to train 4 days per week for hypertrophy. I have a shoulder 
injury so I can't do overhead pressing or heavy bench press. Full gym access.
```

**Expected AI Response:**
```json
{
  "needsMoreInfo": false,
  "templates": [
    {
      "name": "Upper Body A",
      "description": "Shoulder-friendly upper body with horizontal emphasis",
      "category": "upper",
      "exercises": [
        {
          "name": "Incline Dumbbell Press",
          "sets": 4,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90,
          "notes": "30-45 degree angle, easier on shoulders than flat bench"
        },
        {
          "name": "Cable Flyes",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60,
          "notes": "Constant tension, shoulder-friendly"
        },
        {
          "name": "Pull-ups",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        },
        {
          "name": "Cable Row",
          "sets": 4,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90
        },
        {
          "name": "Lateral Raises",
          "sets": 3,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 60,
          "notes": "Light weight, controlled movement"
        },
        {
          "name": "Face Pulls",
          "sets": 3,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 60,
          "notes": "Important for shoulder health"
        },
        {
          "name": "Dumbbell Curl",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 60
        },
        {
          "name": "Tricep Pushdowns",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        }
      ]
    },
    {
      "name": "Lower Body A",
      "description": "Quad-dominant leg training",
      "category": "lower",
      "exercises": [
        {
          "name": "Barbell Squat",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 180
        },
        {
          "name": "Romanian Deadlift",
          "sets": 3,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 120
        },
        {
          "name": "Leg Press",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 90
        },
        {
          "name": "Leg Curl",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Leg Extension",
          "sets": 3,
          "repsMin": 12,
          "repsMax": 15,
          "restSeconds": 60
        },
        {
          "name": "Calf Raises",
          "sets": 4,
          "repsMin": 15,
          "repsMax": 20,
          "restSeconds": 60
        }
      ]
    }
    // Upper B and Lower B would also be generated...
  ]
}
```

---

## Tips for Best Results

### Be Specific

❌ **Vague**: "I want to get fit"
✅ **Specific**: "I want to build muscle and strength as an intermediate lifter training 4 days per week"

### Include Key Information

Always mention:
1. **Goal**: Strength, hypertrophy, endurance, general fitness
2. **Experience**: Beginner, intermediate, advanced
3. **Frequency**: How many days per week
4. **Equipment**: Full gym, home gym, limited equipment
5. **Time**: How long per session
6. **Limitations**: Injuries, equipment restrictions

### Use Natural Language

The AI understands conversational requests:
- "Create a program for me..."
- "I need help designing..."
- "Can you make a workout split..."
- "I'm looking for a routine that..."

### Ask Follow-up Questions

If the AI asks clarifying questions, answer them in your next message. The conversation is contextual.

---

## Common Mistakes to Avoid

### 1. Too Vague
❌ "Make me a workout"
✅ "Create a 3-day full body workout for a beginner with dumbbells only"

### 2. Conflicting Information
❌ "I'm a beginner but want to train 6 days per week with advanced techniques"
✅ "I'm a beginner, what's a good training frequency for me?"

### 3. Unrealistic Expectations
❌ "Give me a program to gain 20lbs of muscle in 1 month"
✅ "Create a hypertrophy program for steady muscle gain over 12 weeks"

### 4. Missing Critical Info
❌ "I want to get stronger" (no mention of equipment or schedule)
✅ "I want to get stronger, I have a barbell and can train 3x per week"

---

## Conclusion

The AI is designed to be conversational and helpful. If it asks clarifying questions, that's a good thing—it means it wants to create the perfect program for your specific situation. Be detailed in your initial request to get templates generated faster!

