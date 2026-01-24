# AI Workout Programmer - Implementation Guide

## Overview

The AI Workout Programmer uses Google's Gemini API to generate personalized workout templates based on user goals, experience, and schedule. It follows fitness programming best practices and includes robust validation and error handling.

---

## Architecture

### Components

1. **API Route** (`/api/ai/generate`)
   - Server-side Gemini API calls
   - Input validation
   - Error handling with safe fallbacks

2. **Chat Interface** (`ChatInterface.tsx`)
   - Conversational UI for user interaction
   - Message history management
   - Real-time feedback and loading states
   - Template creation confirmation

3. **Gemini Library** (`lib/gemini.ts`)
   - Prompt engineering
   - Response parsing and validation
   - Structured output enforcement

4. **Convex Backend** (`convex/ai.ts`)
   - Template creation from AI output
   - Conversation history storage
   - User context retrieval

---

## Prompt Design

### System Prompt Structure

The system prompt is designed to:
1. **Establish expertise**: Position AI as elite strength coach
2. **Define principles**: Evidence-based training standards
3. **Provide guidelines**: Exercise selection, volume, frequency
4. **Enforce structure**: JSON output format with validation rules

### Core Principles Embedded

```
- Progressive Overload: Systematic stress increases
- Volume Landmarks: 
  * Beginner: 10-12 sets/muscle/week
  * Intermediate: 12-18 sets/muscle/week
  * Advanced: 16-22+ sets/muscle/week
- Exercise Selection: Compound first, isolation second
- Rep Ranges:
  * Strength: 1-6 reps
  * Hypertrophy: 6-12 reps
  * Endurance: 12+ reps
- Rest Periods:
  * Strength compounds: 180-300 seconds
  * Hypertrophy compounds: 120-180 seconds
  * Isolation: 60-90 seconds
```

### Clarifying Questions Logic

The AI asks for clarification when:
- Training frequency not specified
- Primary goal unclear
- Experience level unknown
- Equipment access not mentioned
- Time constraints not defined
- Injuries/limitations not addressed

**Example Flow:**
```
User: "I want to build muscle"

AI: "Great! To create the perfect program for you, I need to know:
• How many days per week can you train?
• What's your training experience? (beginner/intermediate/advanced)
• Do you have access to a full gym or limited equipment?
• How much time do you have per session?"
```

---

## Structured Output Format

### JSON Schema

```typescript
{
  needsMoreInfo: boolean,
  clarifyingQuestions?: string[],  // Required if needsMoreInfo = true
  templates?: Array<{              // Required if needsMoreInfo = false
    name: string,
    description: string,
    category: "push" | "pull" | "legs" | "upper" | "lower" | "full_body" | "custom",
    exercises: Array<{
      name: string,
      sets: number,
      repsMin: number,
      repsMax: number,
      restSeconds: number,
      notes?: string
    }>
  }>
}
```

### Validation Rules

1. **Template Level**
   - Name must be non-empty string
   - Category must match enum values
   - Exercises array must have at least 1 exercise

2. **Exercise Level**
   - Name must be non-empty string
   - Sets: 1-6 (typical range)
   - RepsMin: >= 1
   - RepsMax: >= RepsMin
   - RestSeconds: >= 0

3. **Response Level**
   - needsMoreInfo must be boolean
   - If true: clarifyingQuestions required (non-empty array)
   - If false: templates required (non-empty array)

---

## User Context Injection

### Context Data Structure

```typescript
{
  experienceLevel: "beginner" | "intermediate" | "advanced",
  currentTemplates: Array<{
    name: string,
    exercises: string[]
  }>,
  recentWorkouts: Array<{
    templateName: string,
    completedAt: number
  }>
}
```

### Context Usage

The AI uses context to:
- **Avoid duplication**: Don't create templates user already has
- **Match experience**: Adjust volume and complexity
- **Consider frequency**: Recommend splits based on training history
- **Personalize**: Reference user's existing exercises

**Example:**
```
User Context:
- Experience: Intermediate
- Current Templates: ["Push Day A", "Pull Day A"]
- Recent Activity: 8 workouts in last 30 days

AI Response:
"I see you're already running a push/pull split. Let me create a 
complementary Leg Day template to complete your program..."
```

---

## Error Handling & Fallbacks

### Parsing Errors

**Problem**: AI returns malformed JSON or includes markdown

**Solution**:
```typescript
1. Strip markdown code blocks (```json ... ```)
2. Extract JSON from surrounding text
3. Validate structure
4. If parsing fails → return clarifying questions
```

### Validation Errors

**Problem**: AI returns valid JSON but violates business rules

**Solution**:
```typescript
1. Check all required fields
2. Validate data types
3. Verify enum values
4. Ensure logical constraints (repsMax >= repsMin)
5. If validation fails → throw error with specific message
```

### API Errors

**Problem**: Gemini API timeout or rate limit

**Solution**:
```typescript
1. Catch error in API route
2. Return safe fallback response
3. Log error for debugging
4. Show user-friendly error message
```

**Fallback Response**:
```json
{
  "needsMoreInfo": true,
  "clarifyingQuestions": [
    "I encountered an error. Please try rephrasing your request."
  ]
}
```

---

## Fitness Programming Best Practices

### Exercise Selection

**Compound Movements (Priority 1)**:
- Barbell Bench Press (horizontal push)
- Barbell Squat (quad-dominant)
- Deadlift (hip-dominant)
- Barbell Row (horizontal pull)
- Overhead Press (vertical push)
- Pull-ups (vertical pull)

**Accessory Movements (Priority 2)**:
- Dumbbell variations (unilateral work)
- Cable exercises (constant tension)
- Machines (safe isolation)

### Program Splits

**Full Body (3x/week)** - Beginners
```
Session Structure:
- 2-3 compound movements
- 2-3 accessory movements
- Total: 12-15 sets per session
```

**Upper/Lower (4x/week)** - Intermediate
```
Upper Day:
- 3-4 compound (bench, row, OHP, pull-ups)
- 3-4 accessories
- Total: 15-20 sets

Lower Day:
- 2-3 compound (squat, deadlift, leg press)
- 3-4 accessories
- Total: 12-16 sets
```

**Push/Pull/Legs (6x/week)** - Advanced
```
Push Day:
- 2-3 compound (bench, OHP, incline press)
- 4-5 accessories (flyes, lateral raises, triceps)
- Total: 16-20 sets

Pull Day:
- 2-3 compound (deadlift, row, pull-ups)
- 4-5 accessories (curls, face pulls, shrugs)
- Total: 16-20 sets

Leg Day:
- 2-3 compound (squat, RDL, leg press)
- 3-4 accessories (leg curl, calf raises, lunges)
- Total: 14-18 sets
```

### Progressive Overload

**Linear Progression (Beginners)**:
```
When you hit top of rep range for all sets:
- Add 2.5-5 lbs to upper body
- Add 5-10 lbs to lower body
```

**Double Progression (Intermediate)**:
```
1. Increase reps within range (8-12)
2. When all sets hit 12 reps → add weight
3. Drop back to 8 reps with new weight
```

**Periodization (Advanced)**:
```
Week 1-3: Accumulation (higher volume)
Week 4-6: Intensification (higher intensity)
Week 7: Deload (reduced volume)
```

---

## Template Creation Flow

### Step-by-Step Process

1. **User Input**
   ```
   User: "Create a 4-day PPL split for hypertrophy"
   ```

2. **Context Retrieval**
   ```typescript
   const context = await getUserContextForAI({ userId });
   // Returns: experienceLevel, currentTemplates, recentWorkouts
   ```

3. **API Call**
   ```typescript
   const response = await fetch("/api/ai/generate", {
     method: "POST",
     body: JSON.stringify({ userPrompt, userContext })
   });
   ```

4. **Gemini Processing**
   ```typescript
   // Prompt construction
   const prompt = `${SYSTEM_PROMPT}\n\nUSER CONTEXT:\n${context}\n\nUSER REQUEST:\n${userPrompt}`;
   
   // API call with structured output
   const result = await model.generateContent(prompt);
   ```

5. **Response Parsing**
   ```typescript
   // Strip markdown, extract JSON, validate structure
   const parsed = parseAIResponse(result.text());
   validateWorkoutResponse(parsed);
   ```

6. **Template Creation**
   ```typescript
   if (!parsed.needsMoreInfo) {
     const templateIds = await createTemplatesFromAI({
       userId,
       templates: parsed.templates
     });
   }
   ```

7. **Exercise Matching**
   ```typescript
   // For each exercise, find standardized match
   const standardizedExercise = await findStandardizedExercise(
     ctx,
     exercise.name
   );
   // Links to exercise library for analytics
   ```

8. **Confirmation**
   ```typescript
   // Show user summary
   "✅ Created 2 templates:
   1. Push Day A (6 exercises)
   2. Push Day B (6 exercises)"
   ```

---

## Example Conversations

### Example 1: Complete Information

**User**: "Create a 4-day upper/lower split for intermediate lifter focusing on hypertrophy. I have access to a full gym."

**AI Response**:
```json
{
  "needsMoreInfo": false,
  "templates": [
    {
      "name": "Upper Body A",
      "description": "Horizontal push/pull emphasis",
      "category": "upper",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120,
          "notes": "Add weight when you hit 4x10"
        },
        {
          "name": "Barbell Row",
          "sets": 4,
          "repsMin": 8,
          "repsMax": 10,
          "restSeconds": 120
        },
        // ... more exercises
      ]
    },
    {
      "name": "Lower Body A",
      "description": "Quad-dominant focus",
      "category": "lower",
      "exercises": [
        {
          "name": "Barbell Squat",
          "sets": 4,
          "repsMin": 6,
          "repsMax": 8,
          "restSeconds": 180
        },
        // ... more exercises
      ]
    }
    // Upper B and Lower B...
  ]
}
```

### Example 2: Needs Clarification

**User**: "I want to get stronger"

**AI Response**:
```json
{
  "needsMoreInfo": true,
  "clarifyingQuestions": [
    "Great goal! To design the perfect strength program, I need to know:",
    "• How many days per week can you train?",
    "• What's your training experience? (beginner/intermediate/advanced)",
    "• Do you have access to a barbell and squat rack?",
    "• Are there any exercises you can't do due to injury?"
  ]
}
```

**User**: "I can train 3 days per week, I'm a beginner, and I have a full gym"

**AI Response**: [Generates 3-day full body strength program]

### Example 3: Context-Aware

**User Context**:
- Experience: Advanced
- Current Templates: ["Push Day", "Pull Day", "Leg Day"]
- Recent: 12 workouts in 30 days

**User**: "Add more volume to my program"

**AI Response**:
```json
{
  "needsMoreInfo": false,
  "templates": [
    {
      "name": "Push Day B",
      "description": "Second push session with different exercises for more volume",
      "category": "push",
      "exercises": [
        {
          "name": "Incline Dumbbell Press",
          "sets": 4,
          "repsMin": 10,
          "repsMax": 12,
          "restSeconds": 90,
          "notes": "Complement your flat bench work"
        }
        // ... different exercises than existing Push Day
      ]
    }
  ]
}
```

---

## Testing & Validation

### Manual Testing Checklist

- [ ] Complete information → generates templates
- [ ] Incomplete information → asks clarifying questions
- [ ] Malformed AI response → safe fallback
- [ ] Templates saved to database
- [ ] Exercises linked to library
- [ ] Conversation history saved
- [ ] Error states handled gracefully
- [ ] Loading states shown
- [ ] Success confirmation displayed

### Edge Cases

1. **Very long user input**: Truncate or summarize
2. **Conflicting requirements**: Ask user to prioritize
3. **Unrealistic requests**: Educate and suggest alternatives
4. **API timeout**: Retry once, then fallback
5. **Invalid exercise names**: Use fuzzy matching to library

---

## Future Enhancements

### Phase 2 Features

1. **Multi-turn conversations**: Remember context across messages
2. **Program modifications**: "Make leg day harder" → adjust existing template
3. **Periodization**: Generate 12-week programs with progression
4. **Exercise substitutions**: "Replace bench press with dumbbell press"
5. **Form advice**: "How do I improve my squat depth?"

### Phase 3 Features

1. **Video analysis**: Upload form check videos
2. **Plateau detection**: Analyze logs and suggest changes
3. **Deload recommendations**: Auto-detect overtraining
4. **Nutrition integration**: Pair programs with diet advice
5. **Voice input**: Speak workout requests

---

## Monitoring & Quality

### Metrics to Track

- **Success rate**: % of requests that generate valid templates
- **Clarification rate**: % of requests needing more info
- **Error rate**: % of API failures
- **User satisfaction**: Ratings on AI responses
- **Template usage**: % of AI templates actually used

### Quality Assurance

1. **Log all interactions**: Store in `aiInteractions` table
2. **Review failures**: Analyze parsing/validation errors
3. **Prompt iteration**: Improve based on failure patterns
4. **User feedback**: Collect ratings and comments
5. **A/B testing**: Test prompt variations

---

## Conclusion

The AI Workout Programmer combines:
- **Expert knowledge**: Evidence-based training principles
- **Smart prompting**: Structured output with validation
- **Robust engineering**: Error handling and fallbacks
- **User experience**: Conversational interface with context

This creates a system that feels like working with a real coach while maintaining the reliability and scalability of automated software.

