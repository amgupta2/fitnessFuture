/**
 * API Route for AI Form Check (Streaming)
 * Accepts a video file + exercise type via FormData,
 * sends to Gemini multimodal, and streams the analysis back via SSE.
 */

import { NextRequest } from "next/server";
import {
  analyzeExerciseFormStream,
  FORM_CHECK_EXERCISES,
  type SupportedFormCheckExercise,
  type UserContext,
} from "@/lib/gemini";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const exercise = formData.get("exercise") as string | null;
    const userContextRaw = formData.get("userContext") as string | null;

    if (!videoFile || !(videoFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: "video file is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!exercise || !(exercise in FORM_CHECK_EXERCISES)) {
      return new Response(
        JSON.stringify({
          error: `exercise must be one of: ${Object.keys(FORM_CHECK_EXERCISES).join(", ")}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (videoFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Video must be under 20 MB" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const mimeType = videoFile.type || "video/mp4";
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return new Response(
        JSON.stringify({
          error: `Unsupported video format. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert file to base64
    const arrayBuffer = await videoFile.arrayBuffer();
    const base64Video = Buffer.from(arrayBuffer).toString("base64");

    let userContext: UserContext | undefined;
    if (userContextRaw) {
      try {
        userContext = JSON.parse(userContextRaw);
      } catch {
        // Ignore invalid context — analysis works without it
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = analyzeExerciseFormStream(
            base64Video,
            mimeType,
            exercise as SupportedFormCheckExercise,
            userContext
          );

          for await (const chunk of generator) {
            const data = `data: ${JSON.stringify({ chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          const finalResult = await generator.return(undefined as unknown as string);

          if (finalResult.value) {
            const data = `data: ${JSON.stringify({
              done: true,
              text: finalResult.value,
            })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.close();
        } catch (error) {
          console.error("Form check streaming error:", error);
          const errorData = `data: ${JSON.stringify({
            error: "Analysis failed",
            text: "I encountered an error analyzing the video. Please try a shorter clip or different angle.",
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
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Form check API error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to analyze video",
        text: "I encountered an error. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
