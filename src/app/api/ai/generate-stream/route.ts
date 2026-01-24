/**
 * API Route for AI Workout Generation (Streaming)
 * Handles Gemini API calls with streaming responses
 */

import { NextRequest } from "next/server";
import { generateWorkoutProgramStream } from "@/lib/gemini";
import type { UserContext } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPrompt, userContext } = body;

    // Validate inputs
    if (!userPrompt || typeof userPrompt !== "string") {
      return new Response(
        JSON.stringify({ error: "userPrompt is required and must be a string" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!userContext || typeof userContext !== "object") {
      return new Response(
        JSON.stringify({ error: "userContext is required and must be an object" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateWorkoutProgramStream(
            userPrompt,
            userContext as UserContext
          );

          // Stream chunks
          for await (const chunk of generator) {
            const data = `data: ${JSON.stringify({ chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // Get final result
          const finalResult = await generator.return(undefined as any);
          
          if (finalResult.value) {
            const data = `data: ${JSON.stringify({ 
              done: true, 
              result: finalResult.value 
            })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = `data: ${JSON.stringify({ 
            error: "Streaming failed",
            needsMoreInfo: true,
            clarifyingQuestions: [
              "I encountered an error. Could you please rephrase your request?"
            ]
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate workout program",
        needsMoreInfo: true,
        clarifyingQuestions: [
          "I encountered an error. Could you please rephrase your workout goals?",
        ],
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

