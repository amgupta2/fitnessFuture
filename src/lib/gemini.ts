/**
 * Gemini API integration for AI-powered workout programming
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * System prompt for workout programming
 */
const WORKOUT_PROGRAMMER_SYSTEM_PROMPT = `You are an elite strength and conditioning coach with expertise in evidence-based training programming. Your role is to design personalized workout programs that follow professional fitness standards.

CORE PRINCIPLES:
- Progressive overload: Systematic stress increases over time
- Volume landmarks: Beginner (10-12 sets/muscle/week), Intermediate (12-18), Advanced (16-22+)
- Exercise selection: Compound movements first, isolation second
- Rep ranges: Strength (1-6 reps), Hypertrophy (6-12), Endurance (12+)
- Rest periods: Compound exercises (180-300 sec), Isolation (60-90 sec), Hypertrophy (60-120 sec)
- Frequency: Each muscle group trained 2-3x per week for optimal growth

EXPERIENCE LEVELS:
- Beginner: <1 year training, focus on form and neural adaptations, full-body or upper/lower splits
- Intermediate: 1-3 years, can handle more volume, PPL or body-part splits
- Advanced: 3+ years, requires high volume and intensity, specialized programming

EXERCISE SELECTION GUIDELINES:
- Compound movements: Barbell Bench Press, Squat, Deadlift, Overhead Press, Barbell Row, Pull-ups
- Hypertrophy accessories: Dumbbell exercises, cable work, machines for isolation
- Balance: For every horizontal push, include horizontal pull. For every vertical push, include vertical pull
- Leg training: Include both quad-dominant (squat) and hip-dominant (deadlift/RDL) movements

PROGRAM DESIGN:
- Full Body (3x/week): 2-3 compound + 2-3 accessories per session
- Upper/Lower (4x/week): 3-4 compound + 3-4 accessories per session
- Push/Pull/Legs (6x/week): 2-3 compound + 4-5 accessories per session
- Body Part Split (5-6x/week): 1-2 compound + 5-7 isolation per session

CLARIFYING QUESTIONS:
Ask if the user hasn't specified:
1. Training frequency (how many days per week?)
2. Primary goal (strength, hypertrophy, endurance, general fitness?)
3. Experience level (beginner, intermediate, advanced?)
4. Equipment access (full gym, home gym, limited equipment?)
5. Time per session (30min, 60min, 90min+?)
6. Any injuries or limitations?

OUTPUT FORMAT (when generating templates):
Return ONLY valid JSON (no markdown, no explanation text before or after):
{
  "needsMoreInfo": false,
  "clarifyingQuestions": [],
  "templates": [
    {
      "name": "Push Day A",
      "description": "Chest, shoulders, triceps focus with progressive overload",
      "category": "push",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 4,
          "repsMin": 6,
          "repsMax": 8,
          "restSeconds": 180,
          "notes": "Focus on full ROM and controlled eccentric, add 2.5-5lbs when you hit 4x8"
        }
      ]
    }
  ]
}

If you need more information, set needsMoreInfo to true and provide 2-4 clarifyingQuestions in the array.

IMPORTANT: 
- Use exact exercise names from standard library when possible (e.g., "Barbell Bench Press" not "bench press")
- Category must be one of: push, pull, legs, upper, lower, full_body, custom
- Sets should be 2-6 for most exercises
- RepsMin and RepsMax should create realistic ranges (e.g., 6-8, 8-12, 12-15)
- RestSeconds: 60-90 for isolation, 120-180 for hypertrophy compounds, 180-300 for strength
- Include progression notes where helpful`;

/**
 * Unified user context — used by BOTH programmer and trainer modes.
 * All fields are optional except experienceLevel so the functions degrade
 * gracefully when called without a full profile (e.g. new users).
 */
export interface UserContext {
  // ── Core profile ──────────────────────────────────────────────────────────
  experienceLevel: "beginner" | "intermediate" | "advanced";
  weightUnit?: "kg" | "lbs";
  primaryGoal?: string;
  targetMuscleGroups?: string[];
  availableEquipment?: string[];
  trainingDaysPerWeek?: number;
  sessionDurationMinutes?: number;
  age?: number;
  bodyWeight?: number;
  injuries?: string[];
  sleepQuality?: string;
  stressLevel?: string;
  occupationType?: string;

  // ── Current programming (with full parameters) ───────────────────────────
  currentTemplates?: Array<{
    name: string;
    exercises: Array<{
      name: string;
      sets?: number;
      repsMin?: number;
      repsMax?: number;
      rest?: number;
      notes?: string;
    }>;
  }>;
  recentWorkouts?: Array<{
    templateName: string;
    completedAt: number;
  }>;

  // ── Performance analytics (last 30 days) ─────────────────────────────────
  recentExercises?: Array<{
    name: string;
    sets: number;
    avgWeight: number;
    avgReps: number;
    lastPerformed: number;
  }>;
  totalVolume?: number;
  trainingFrequency?: number;

  // ── Strength levels ───────────────────────────────────────────────────────
  personalRecords?: Array<{
    exerciseName: string;
    estimated1RM: number;
  }>;
}

/**
 * TrainingContext is identical to UserContext — kept as alias for backwards compat.
 */
export type TrainingContext = UserContext;

/**
 * AI response format
 */
export interface WorkoutProgramResponse {
  needsMoreInfo: boolean;
  clarifyingQuestions?: string[];
  templates?: Array<{
    name: string;
    description: string;
    category: "push" | "pull" | "legs" | "upper" | "lower" | "full_body" | "custom";
    exercises: Array<{
      name: string;
      sets: number;
      repsMin: number;
      repsMax: number;
      restSeconds: number;
      notes?: string;
    }>;
  }>;
}

/**
 * Generate workout program using Gemini (streaming version)
 */
export async function* generateWorkoutProgramStream(
  userPrompt: string,
  userContext: UserContext,
  history: ConversationTurn[] = []
): AsyncGenerator<string, WorkoutProgramResponse, undefined> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    // Build context-aware prompt
    const contextPrompt = buildContextPrompt(userPrompt, userContext, history);

    const result = await model.generateContentStream(contextPrompt);
    
    let fullText = "";
    
    // Stream chunks as they arrive
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      yield chunkText;
    }

    // Parse final response
    const parsed = parseAIResponse(fullText);

    // Validate structure
    validateWorkoutResponse(parsed);

    return parsed;
  } catch (error) {
    console.error("Gemini API error:", error);

    // Safe fallback
    return {
      needsMoreInfo: true,
      clarifyingQuestions: [
        "I encountered an error processing your request. Could you please rephrase your workout goals?",
      ],
    };
  }
}

/**
 * Generate workout program using Gemini (non-streaming fallback)
 */
export async function generateWorkoutProgram(
  userPrompt: string,
  userContext: UserContext,
  history: ConversationTurn[] = []
): Promise<WorkoutProgramResponse> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    // Build context-aware prompt
    const contextPrompt = buildContextPrompt(userPrompt, userContext, history);

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const parsed = parseAIResponse(text);

    // Validate structure
    validateWorkoutResponse(parsed);

    return parsed;
  } catch (error) {
    console.error("Gemini API error:", error);

    // Safe fallback
    return {
      needsMoreInfo: true,
      clarifyingQuestions: [
        "I encountered an error processing your request. Could you please rephrase your workout goals?",
      ],
    };
  }
}

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Format recent conversation turns into a prompt block.
 * Strips markdown/emoji noise from assistant messages so the model
 * doesn't get confused by its own formatting artifacts.
 */
function buildHistoryBlock(history: ConversationTurn[]): string {
  if (!history.length) return "";

  const lines = history.map(turn => {
    const label = turn.role === "user" ? "[USER]" : "[COACH]";
    // Truncate very long assistant messages (template summaries etc.) to 300 chars
    const content =
      turn.role === "assistant" && turn.content.length > 300
        ? turn.content.slice(0, 300) + "…"
        : turn.content;
    return `${label}: ${content}`;
  });

  return `=== CONVERSATION HISTORY (most recent first — use for continuity) ===\n${lines.join("\n")}\n`;
}

/**
 * Build the shared athlete profile block used in both programmer and trainer prompts.
 * Includes all profile fields, strength levels, exercise history, and current programming.
 */
function buildAthleteProfile(context: UserContext): string {
  const unit = context.weightUnit ?? "lbs";
  let p = "";

  // ── Profile ──────────────────────────────────────────────────────────────
  p += `=== ATHLETE PROFILE ===\n`;
  p += `Experience: ${context.experienceLevel}\n`;
  p += `Weight unit: ${unit} — use ${unit} for ALL weight suggestions\n`;
  if (context.primaryGoal) p += `Primary goal: ${context.primaryGoal}\n`;
  if (context.trainingDaysPerWeek) p += `Availability: ${context.trainingDaysPerWeek} days/week\n`;
  if (context.sessionDurationMinutes) p += `Session length: ${context.sessionDurationMinutes} min\n`;
  if (context.availableEquipment?.length)
    p += `Equipment: ${context.availableEquipment.join(", ")}\n`;
  if (context.targetMuscleGroups?.length)
    p += `Priority muscles: ${context.targetMuscleGroups.join(", ")}\n`;
  if (context.injuries?.length)
    p += `⚠️ Injuries/limitations: ${context.injuries.join(", ")} — NEVER prescribe exercises that directly load these structures\n`;
  if (context.age || context.bodyWeight) {
    const parts: string[] = [];
    if (context.age) parts.push(`age ${context.age}`);
    if (context.bodyWeight) parts.push(`bodyweight ${context.bodyWeight} ${unit}`);
    p += `Physical: ${parts.join(", ")}\n`;
  }
  if (context.sleepQuality || context.stressLevel || context.occupationType) {
    const parts: string[] = [];
    if (context.sleepQuality) parts.push(`sleep ${context.sleepQuality}`);
    if (context.stressLevel) parts.push(`stress ${context.stressLevel}`);
    if (context.occupationType) parts.push(`occupation ${context.occupationType}`);
    p += `Lifestyle: ${parts.join(" | ")}\n`;
  }

  // ── Strength levels (from PRs) ────────────────────────────────────────────
  if (context.personalRecords && context.personalRecords.length > 0) {
    p += `\n=== CURRENT STRENGTH LEVELS (estimated 1RM) ===\n`;
    context.personalRecords.forEach(pr => {
      p += `- ${pr.exerciseName}: ${pr.estimated1RM} ${unit}\n`;
    });
  }

  // ── Recent performance ────────────────────────────────────────────────────
  if (context.recentExercises && context.recentExercises.length > 0) {
    p += `\n=== RECENT PERFORMANCE (last 30 days, working sets only) ===\n`;
    context.recentExercises.forEach(e => {
      p += `- ${e.name}: ${e.sets} sets × ${e.avgReps} reps @ ${e.avgWeight} ${unit}\n`;
    });
  }
  if (context.trainingFrequency) {
    p += `Training frequency: ${context.trainingFrequency} sessions/week\n`;
  }
  if (context.totalVolume) {
    p += `Monthly volume: ~${Math.round(context.totalVolume / 1000)}K ${unit}\n`;
  }

  // ── Current program ───────────────────────────────────────────────────────
  if (context.currentTemplates && context.currentTemplates.length > 0) {
    p += `\n=== CURRENT PROGRAM (build on or replace as needed — do not duplicate) ===\n`;
    context.currentTemplates.forEach(t => {
      p += `${t.name}:\n`;
      t.exercises.forEach(e => {
        const reps =
          e.repsMin && e.repsMax
            ? `${e.repsMin}-${e.repsMax}`
            : e.repsMin ?? e.repsMax ?? "?";
        const rest = e.rest ? ` | ${e.rest}s rest` : "";
        const notes = e.notes ? ` [${e.notes}]` : "";
        p += `  • ${e.name}: ${e.sets ?? "?"} × ${reps} reps${rest}${notes}\n`;
      });
    });
  } else if (context.recentWorkouts && context.recentWorkouts.length > 0) {
    p += `\nRecent sessions: ${context.recentWorkouts.length} workouts in last 30 days\n`;
  }

  return p;
}

/**
 * Build context-aware prompt for workout program generation.
 */
function buildContextPrompt(
  userPrompt: string,
  context: UserContext,
  history: ConversationTurn[] = []
): string {
  const parts = [WORKOUT_PROGRAMMER_SYSTEM_PROMPT, "", buildAthleteProfile(context)];
  if (history.length) parts.push("", buildHistoryBlock(history));
  parts.push("", `=== USER REQUEST ===`, userPrompt, "", `RESPONSE (JSON only, no markdown):`);
  return parts.join("\n");
}

/**
 * Parse AI response, handling markdown code blocks and malformed JSON
 */
function parseAIResponse(text: string): WorkoutProgramResponse {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();

    // Remove ```json ... ``` wrapper
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    // Remove any leading/trailing non-JSON text
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    // Try to fix common JSON issues with incomplete streams
    // If JSON is incomplete, try to close it
    if (cleaned.includes('"templates"') && !cleaned.endsWith("}")) {
      // Count opening and closing braces
      const openBraces = (cleaned.match(/{/g) || []).length;
      const closeBraces = (cleaned.match(/}/g) || []).length;
      const missing = openBraces - closeBraces;
      
      // Add missing closing braces
      if (missing > 0) {
        cleaned += "}".repeat(missing);
      }
    }

    // Parse JSON
    const parsed = JSON.parse(cleaned);
    
    // Ensure required fields exist
    if (typeof parsed.needsMoreInfo !== "boolean") {
      parsed.needsMoreInfo = false;
    }
    
    // If both needsMoreInfo and templates exist, prioritize templates
    // (AI sometimes includes both)
    if (parsed.needsMoreInfo && parsed.templates && parsed.templates.length > 0) {
      parsed.needsMoreInfo = false;
      delete parsed.clarifyingQuestions;
    }
    
    return parsed;
  } catch (error) {
    console.error("JSON parse error:", error);
    console.error("Raw text:", text);

    // Fallback: ask for clarification
    return {
      needsMoreInfo: true,
      clarifyingQuestions: [
        "I had trouble understanding your request. Could you describe your fitness goals more specifically? Include:",
        "• Your experience level (beginner/intermediate/advanced)",
        "• How many days per week you can train",
        "• Your primary goal (strength, muscle gain, fat loss, etc.)",
      ],
    };
  }
}

/**
 * Validate workout response structure
 */
function validateWorkoutResponse(response: WorkoutProgramResponse): void {
  if (typeof response.needsMoreInfo !== "boolean") {
    throw new Error("Invalid response: needsMoreInfo must be boolean");
  }

  // If we have templates, that's what matters (even if needsMoreInfo is true)
  if (response.templates && Array.isArray(response.templates) && response.templates.length > 0) {
    // Validate templates
    response.templates.forEach((template, idx) => {
      if (!template.name || typeof template.name !== "string") {
        throw new Error(`Template ${idx}: name is required`);
      }
      if (!template.category) {
        throw new Error(`Template ${idx}: category is required`);
      }
      if (!Array.isArray(template.exercises) || template.exercises.length === 0) {
        throw new Error(`Template ${idx}: exercises array is required`);
      }

      // Validate each exercise
      template.exercises.forEach((exercise, exerciseIdx) => {
        if (!exercise.name || typeof exercise.name !== "string") {
          throw new Error(`Template ${idx}, Exercise ${exerciseIdx}: name is required`);
        }
        if (typeof exercise.sets !== "number" || exercise.sets < 1) {
          throw new Error(`Template ${idx}, Exercise ${exerciseIdx}: sets must be number >= 1`);
        }
        if (typeof exercise.repsMin !== "number" || exercise.repsMin < 1) {
          throw new Error(`Template ${idx}, Exercise ${exerciseIdx}: repsMin must be number >= 1`);
        }
        if (typeof exercise.repsMax !== "number" || exercise.repsMax < exercise.repsMin) {
          throw new Error(`Template ${idx}, Exercise ${exerciseIdx}: repsMax must be >= repsMin`);
        }
        if (typeof exercise.restSeconds !== "number" || exercise.restSeconds < 0) {
          throw new Error(`Template ${idx}, Exercise ${exerciseIdx}: restSeconds must be number >= 0`);
        }
      });
    });
    return; // Valid templates response
  }

  // No templates, so check for clarifying questions
  if (response.needsMoreInfo) {
    if (!Array.isArray(response.clarifyingQuestions) || response.clarifyingQuestions.length === 0) {
      throw new Error("Invalid response: needsMoreInfo=true requires clarifyingQuestions");
    }
  } else {
    // needsMoreInfo is false but no templates
    throw new Error("Invalid response: needsMoreInfo=false requires templates array");
  }
}

/**
 * System prompt for training advice and technique coaching
 */
const TRAINING_COACH_SYSTEM_PROMPT = `You are an elite strength and conditioning coach specializing in movement technique, program troubleshooting, and evidence-based training advice.

YOUR ROLE:
- Answer movement-specific questions with precise technical cues
- Diagnose common training issues (plateaus, form breakdown, imbalances)
- Provide practical, actionable advice
- Reference biomechanics and muscle activation
- Suggest videos and articles when helpful

RESPONSE STYLE:
- Concise and practical (2-4 paragraphs max)
- Evidence-based (cite principles, not just opinions)
- Action-oriented (what to DO, not just theory)
- Progressive (beginner → intermediate → advanced variations)

CONTENT TO INCLUDE:
1. **Direct Answer**: Address the specific question
2. **Key Cues**: 2-3 actionable form cues
3. **Target Muscles**: Primary and secondary muscles involved
4. **Common Mistakes**: What to avoid
5. **Progression**: How to improve or adjust
6. **Resources** (when relevant): YouTube channels or article topics to search

TONE:
- Confident but approachable
- Concise but thorough
- Educational without being preachy

EXAMPLE STRUCTURE:
"[Direct answer to question]

Key cues:
• [Cue 1]
• [Cue 2]
• [Cue 3]

[Explanation of why this works / common mistakes]

Target muscles: [Primary muscles] (primary), [Secondary muscles] (secondary)

[Progression tip or variation]

For visual demos, search YouTube for: '[specific search term]' or '[channel name]'"`;

// TrainingContext is defined above as: export type TrainingContext = UserContext

/**
 * Generate training advice (for follow-up questions)
 */
export async function generateTrainingAdvice(
  question: string,
  trainingContext: TrainingContext,
  history: ConversationTurn[] = []
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    });

    const historyBlock = history.length ? `\n\n${buildHistoryBlock(history)}` : "";
    const prompt = `${TRAINING_COACH_SYSTEM_PROMPT}\n\n${buildAthleteProfile(trainingContext)}${historyBlock}\n\n=== ATHLETE'S QUESTION ===\n${question}\n\nRESPONSE:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I encountered an error processing your question. Please try again.";
  }
}

/**
 * Streaming version of training advice
 */
export async function* generateTrainingAdviceStream(
  question: string,
  trainingContext: TrainingContext,
  history: ConversationTurn[] = []
): AsyncGenerator<string, string, undefined> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    });

    const historyBlock = history.length ? `\n\n${buildHistoryBlock(history)}` : "";
    const prompt = `${TRAINING_COACH_SYSTEM_PROMPT}\n\n${buildAthleteProfile(trainingContext)}${historyBlock}\n\n=== ATHLETE'S QUESTION ===\n${question}\n\nRESPONSE:`;

    const result = await model.generateContentStream(prompt);
    
    let fullText = "";
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      yield chunkText;
    }

    return fullText;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I encountered an error processing your question. Please try again.";
  }
}

// ============================================================================
// FORM CHECK — Video analysis via Gemini multimodal
// ============================================================================

export type SupportedFormCheckExercise =
  | "barbell_back_squat"
  | "barbell_bench_press"
  | "conventional_deadlift"
  | "barbell_row"
  | "overhead_press";

export const FORM_CHECK_EXERCISES: Record<
  SupportedFormCheckExercise,
  { label: string; prompt: string }
> = {
  barbell_back_squat: {
    label: "Barbell Back Squat",
    prompt: `EXERCISE: Barbell Back Squat

Analyze the following form checkpoints and provide specific feedback:

DESCENT PHASE:
- Hip hinge initiation (hips break before knees?)
- Depth (hip crease relative to knee — at or below parallel?)
- Knee tracking (over toes, not caving inward?)
- Spine angle (neutral? excessive forward lean?)

BOTTOM POSITION:
- Butt wink (posterior pelvic tilt at bottom?)
- Weight distribution (mid-foot? heels rising?)
- Thoracic extension maintained?

ASCENT PHASE:
- Drive pattern (hips and shoulders rise together, or hips shoot back?)
- Knee cave on ascent?
- Bar path (vertical over mid-foot?)
- Lockout (full hip and knee extension?)

GENERAL:
- Bracing quality (visible valsalva / belt use?)
- Tempo (controlled eccentric?)
- Bar position (high bar vs low bar — is it stable on the shelf?)
- Stance width and foot angle`,
  },
  barbell_bench_press: {
    label: "Barbell Bench Press",
    prompt: `EXERCISE: Barbell Bench Press

Analyze the following form checkpoints and provide specific feedback:

SETUP:
- Back arch (slight natural arch, retracted scapulae?)
- Foot placement (flat on floor, driving into ground?)
- Grip width (forearms vertical at bottom?)
- Shoulder blade retraction and depression?

DESCENT (ECCENTRIC):
- Bar path (slight diagonal from lockout to lower chest?)
- Elbow tuck angle (~45-75 degrees, not flared at 90?)
- Touch point (at or below nipple line?)
- Tempo (controlled, not dropping the bar?)

PRESS (CONCENTRIC):
- Drive pattern (leg drive engagement?)
- Bar path (slight J-curve back toward face?)
- Lockout (elbows fully extended, not hyperextended?)
- Butt stays on bench throughout?

GENERAL:
- Wrist alignment (straight, not bent back?)
- Breathing pattern (inhale on descent, exhale on press?)
- Spotter positioning if visible
- Symmetry (bar level throughout, no side tilting?)`,
  },
  conventional_deadlift: {
    label: "Conventional Deadlift",
    prompt: `EXERCISE: Conventional Deadlift

Analyze the following form checkpoints and provide specific feedback:

SETUP:
- Foot position (hip-width, mid-foot under bar?)
- Hip hinge (hips higher than knees, lower than shoulders?)
- Grip (just outside knees, arms straight?)
- Spine position (neutral from cervical to lumbar?)
- Shoulder position (over or slightly in front of bar?)

PULL (CONCENTRIC):
- Initiation (pushing floor away, not pulling with back?)
- Bar path (vertical, staying close to body?)
- Back angle (consistent until bar passes knees?)
- Hip and knee extension timing (not stiff-legging it?)
- Upper back rounding (minimal?)

LOCKOUT:
- Full hip extension (glutes squeezed?)
- Shoulders back (not hyperextending lumbar?)
- Knees fully locked?

DESCENT (ECCENTRIC):
- Hip hinge first (not squatting the bar down?)
- Bar stays close to body?
- Controlled descent?

GENERAL:
- Bracing and breathing (valsalva before each rep?)
- Grip type (double overhand, mixed, hook — any issues?)
- Shin position (not excessive forward travel?)`,
  },
  barbell_row: {
    label: "Barbell Bent-Over Row",
    prompt: `EXERCISE: Barbell Bent-Over Row

Analyze the following form checkpoints and provide specific feedback:

SETUP:
- Hip hinge angle (torso roughly 30-45 degrees from horizontal?)
- Knee bend (slight, for stability?)
- Grip width and type (overhand vs underhand?)
- Spine neutral throughout?

PULL (CONCENTRIC):
- Row path (pulling toward lower chest / upper abdomen?)
- Elbow drive (behind the body, squeezing shoulder blades?)
- Torso stability (no excessive "heaving" or momentum?)
- Full range of motion (full scapular retraction at top?)

LOWERING (ECCENTRIC):
- Controlled descent (not dropping the weight?)
- Full stretch at bottom (arms extended, scapulae protracted?)

GENERAL:
- Body English (excessive swinging or momentum?)
- Head position (neutral, not cranking neck up?)
- Lower back stress (any rounding under load?)
- Breathing pattern`,
  },
  overhead_press: {
    label: "Overhead Press (Barbell)",
    prompt: `EXERCISE: Overhead Press (Barbell)

Analyze the following form checkpoints and provide specific feedback:

SETUP:
- Rack position (bar resting on front deltoids / upper chest?)
- Grip width (just outside shoulders?)
- Elbow position (slightly in front of bar?)
- Stance (hip-width, stable base?)

PRESS (CONCENTRIC):
- Bar path (straight vertical line, head moves back to clear?)
- Head through (moving head forward once bar clears?)
- Core bracing (no excessive lean-back?)
- Full lockout overhead (bar over mid-foot, biceps by ears?)

LOWERING (ECCENTRIC):
- Controlled descent back to rack position?
- Head clears the bar path?

GENERAL:
- Lower back position (no excessive arching / turning it into an incline press?)
- Wrist alignment (straight, bar sits on heel of palm?)
- Breathing pattern (breath before press, exhale at top?)
- Rib flare (ribs staying down, core tight?)
- Knee involvement (no push-press unless intentional?)`,
  },
};

const FORM_CHECK_SYSTEM_PROMPT = `You are an elite biomechanics analyst and strength coach specializing in movement assessment. You are reviewing a video of an athlete performing a lift.

YOUR TASK:
Analyze the athlete's exercise form in the video against the provided checklist. Be specific, practical, and reference what you actually see in the video.

OUTPUT FORMAT (use this exact structure in markdown):

## Form Score: X/10

### Summary
[1-2 sentence overall assessment]

### What You're Doing Well
[Bullet list of 2-4 things the athlete is doing correctly]

### Issues Found
[For each issue:]
- **[Issue name]** (Timestamp: ~Xs) — [Severity: NEEDS WORK or CRITICAL]
  [Specific description of what you see vs what it should look like]
  *Fix:* [1-2 sentence actionable correction]

### Key Corrections (Priority Order)
1. [Most important fix with specific cue]
2. [Second most important fix]
3. [Third if applicable]

### Drill Recommendations
[1-2 drills or accessory exercises to address the main issues]

RULES:
- Only comment on what is VISIBLE in the video. If the camera angle doesn't show something, say so instead of guessing.
- Be encouraging but honest — safety-critical issues must be flagged clearly.
- Reference approximate timestamps when pointing out specific moments.
- Tailor advice to the athlete's apparent experience level based on load and movement quality.
- Keep the total response concise (under 500 words).`;

/**
 * Analyze exercise form from a video using Gemini multimodal.
 * Accepts base64 video data and streams the analysis back.
 */
export async function* analyzeExerciseFormStream(
  base64Video: string,
  mimeType: string,
  exercise: SupportedFormCheckExercise,
  userContext?: UserContext
): AsyncGenerator<string, string, undefined> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    });

    const exerciseInfo = FORM_CHECK_EXERCISES[exercise];
    let prompt = `${FORM_CHECK_SYSTEM_PROMPT}\n\n${exerciseInfo.prompt}\n`;

    if (userContext) {
      const unit = userContext.weightUnit ?? "lbs";
      prompt += `\nATHLETE CONTEXT:\n- Experience: ${userContext.experienceLevel}\n`;
      if (userContext.injuries?.length) {
        prompt += `- Known injuries: ${userContext.injuries.join(", ")}\n`;
      }
      if (userContext.personalRecords?.length) {
        const relevant = userContext.personalRecords.find(
          (pr) => pr.exerciseName.toLowerCase().includes(exerciseInfo.label.split(" ")[1]?.toLowerCase() ?? "")
        );
        if (relevant) {
          prompt += `- Estimated 1RM for this lift: ${relevant.estimated1RM} ${unit}\n`;
        }
      }
    }

    prompt += `\nAnalyze the video now. Score each checkpoint as GOOD / NEEDS WORK / CRITICAL.`;

    const result = await model.generateContentStream([
      {
        inlineData: {
          data: base64Video,
          mimeType,
        },
      },
      { text: prompt },
    ]);

    let fullText = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      yield chunkText;
    }

    return fullText;
  } catch (error) {
    console.error("Form check Gemini API error:", error);
    return "I encountered an error analyzing the video. Please ensure the video is clear and try again.";
  }
}

/**
 * Generate exercise substitutions using AI
 * Suggests alternatives based on muscle groups, equipment, and movement patterns
 */
export async function generateExerciseSubstitutions(
  exerciseName: string,
  availableEquipment: string[],
  reason?: string
): Promise<{
  substitutions: Array<{
    name: string;
    reason: string;
    difficulty: "easier" | "similar" | "harder";
    equipment: string;
  }>;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `You are a strength and conditioning coach. A user needs to substitute an exercise.

**Exercise to replace:** ${exerciseName}
**Available equipment:** ${availableEquipment.join(", ")}
**Reason for substitution:** ${reason || "Not specified"}

Suggest 3-5 alternative exercises that:
1. Target the same primary muscle groups
2. Match similar movement patterns
3. Can be done with available equipment
4. Vary in difficulty (easier, similar, harder)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "substitutions": [
    {
      "name": "Exercise name",
      "reason": "Brief explanation why this works",
      "difficulty": "easier|similar|harder",
      "equipment": "barbell|dumbbell|machine|cable|bodyweight"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const parsed = parseAIResponse(text);
    return parsed as any;
  } catch (error) {
    console.error("Exercise substitution error:", error);
    // Fallback: return generic alternatives
    return {
      substitutions: [
        {
          name: "Consult exercise library for alternatives",
          reason: "AI substitution unavailable. Browse exercises by muscle group.",
          difficulty: "similar" as const,
          equipment: "various",
        },
      ],
    };
  }
}
