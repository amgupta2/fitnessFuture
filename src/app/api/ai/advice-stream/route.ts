/**
 * API Route for AI Training Advice (Streaming)
 * Handles technique questions, form advice, and program troubleshooting
 */

import { NextRequest } from "next/server";
import { generateTrainingAdviceStream } from "@/lib/gemini";
import type { TrainingContext, ConversationTurn } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, trainingContext, conversationHistory } = body;
    const history: ConversationTurn[] = Array.isArray(conversationHistory)
      ? conversationHistory.slice(0, 4) // enforce cap at route boundary
      : [];

    // Validate inputs
    if (!question || typeof question !== "string") {
      return new Response(
        JSON.stringify({ error: "question is required and must be a string" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!trainingContext || typeof trainingContext !== "object") {
      return new Response(
        JSON.stringify({ error: "trainingContext is required and must be an object" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateTrainingAdviceStream(
            question,
            trainingContext as TrainingContext,
            history
          );

          // Stream text chunks
          for await (const chunk of generator) {
            const data = `data: ${JSON.stringify({ chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // Get final result
          const finalResult = await generator.return(undefined as any);
          
          if (finalResult.value) {
            const data = `data: ${JSON.stringify({ 
              done: true, 
              text: finalResult.value 
            })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = `data: ${JSON.stringify({ 
            error: "Streaming failed",
            text: "I encountered an error. Could you please rephrase your question?"
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
        error: "Failed to generate training advice",
        text: "I encountered an error. Please try again.",
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

