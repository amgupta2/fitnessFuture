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
 * User context for personalization
 */
export interface UserContext {
  experienceLevel: "beginner" | "intermediate" | "advanced";
  currentTemplates?: Array<{
    name: string;
    exercises: string[];
  }>;
  recentWorkouts?: Array<{
    templateName: string;
    completedAt: number;
  }>;
}

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
  userContext: UserContext
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
    const contextPrompt = buildContextPrompt(userPrompt, userContext);

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
  userContext: UserContext
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
    const contextPrompt = buildContextPrompt(userPrompt, userContext);

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

/**
 * Build context-aware prompt with user data
 */
function buildContextPrompt(userPrompt: string, context: UserContext): string {
  let prompt = `${WORKOUT_PROGRAMMER_SYSTEM_PROMPT}\n\n`;

  prompt += `USER CONTEXT:\n`;
  prompt += `- Experience Level: ${context.experienceLevel}\n`;

  if (context.currentTemplates && context.currentTemplates.length > 0) {
    prompt += `- Current Templates:\n`;
    context.currentTemplates.forEach(t => {
      prompt += `  * ${t.name}: ${t.exercises.join(", ")}\n`;
    });
  }

  if (context.recentWorkouts && context.recentWorkouts.length > 0) {
    prompt += `- Recent Activity: ${context.recentWorkouts.length} workouts in last 30 days\n`;
  }

  prompt += `\nUSER REQUEST:\n${userPrompt}\n\n`;
  prompt += `RESPONSE (JSON only, no markdown):`;

  return prompt;
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

/**
 * Enhanced user context for training advice
 */
export interface TrainingContext extends UserContext {
  recentExercises?: Array<{
    name: string;
    sets: number;
    avgWeight: number;
    avgReps: number;
    lastPerformed: number;
  }>;
  totalVolume?: number;
  trainingFrequency?: number;
}

/**
 * Generate training advice (for follow-up questions)
 */
export async function generateTrainingAdvice(
  question: string,
  trainingContext: TrainingContext
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    });

    // Build context-aware prompt
    let contextInfo = `User Experience Level: ${trainingContext.experienceLevel}\n`;
    
    if (trainingContext.currentTemplates && trainingContext.currentTemplates.length > 0) {
      contextInfo += `\nCurrent Program:\n`;
      trainingContext.currentTemplates.forEach(t => {
        contextInfo += `- ${t.name}: ${t.exercises.join(", ")}\n`;
      });
    }

    if (trainingContext.recentExercises && trainingContext.recentExercises.length > 0) {
      contextInfo += `\nRecent Performance:\n`;
      trainingContext.recentExercises.slice(0, 5).forEach(e => {
        contextInfo += `- ${e.name}: ${e.sets} sets × ${e.avgReps} reps @ ${e.avgWeight}lbs\n`;
      });
    }

    if (trainingContext.trainingFrequency) {
      contextInfo += `\nTraining Frequency: ${trainingContext.trainingFrequency} sessions/week\n`;
    }

    const prompt = `${TRAINING_COACH_SYSTEM_PROMPT}

USER CONTEXT:
${contextInfo}

USER QUESTION:
${question}

RESPONSE:`;

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
  trainingContext: TrainingContext
): AsyncGenerator<string, string, undefined> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    });

    // Build context-aware prompt (same as non-streaming)
    let contextInfo = `User Experience Level: ${trainingContext.experienceLevel}\n`;
    
    if (trainingContext.currentTemplates && trainingContext.currentTemplates.length > 0) {
      contextInfo += `\nCurrent Program:\n`;
      trainingContext.currentTemplates.forEach(t => {
        contextInfo += `- ${t.name}: ${t.exercises.join(", ")}\n`;
      });
    }

    if (trainingContext.recentExercises && trainingContext.recentExercises.length > 0) {
      contextInfo += `\nRecent Performance:\n`;
      trainingContext.recentExercises.slice(0, 5).forEach(e => {
        contextInfo += `- ${e.name}: ${e.sets} sets × ${e.avgReps} reps @ ${e.avgWeight}lbs\n`;
      });
    }

    if (trainingContext.trainingFrequency) {
      contextInfo += `\nTraining Frequency: ${trainingContext.trainingFrequency} sessions/week\n`;
    }

    const prompt = `${TRAINING_COACH_SYSTEM_PROMPT}

USER CONTEXT:
${contextInfo}

USER QUESTION:
${question}

RESPONSE:`;

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
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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
