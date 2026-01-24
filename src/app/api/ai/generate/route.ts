/**
 * API Route for AI Workout Generation
 * Handles Gemini API calls server-side with proper error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutProgram } from "@/lib/gemini";
import type { UserContext } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPrompt, userContext } = body;

    // Validate inputs
    if (!userPrompt || typeof userPrompt !== "string") {
      return NextResponse.json(
        { error: "userPrompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (!userContext || typeof userContext !== "object") {
      return NextResponse.json(
        { error: "userContext is required and must be an object" },
        { status: 400 }
      );
    }

    // Call Gemini API
    const result = await generateWorkoutProgram(
      userPrompt,
      userContext as UserContext
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate workout program",
        needsMoreInfo: true,
        clarifyingQuestions: [
          "I encountered an error. Could you please rephrase your workout goals or try asking something more specific?",
        ],
      },
      { status: 500 }
    );
  }
}

