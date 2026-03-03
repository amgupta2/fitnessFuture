/**
 * API Route for AI Nutrition Analysis.
 * Accepts either:
 *   - multipart/form-data with an image file (photo mode)
 *   - JSON body with { description: string } (text mode)
 * Returns structured NutritionAnalysisResult JSON.
 */

import { NextRequest } from "next/server";
import {
  analyzeNutritionFromPhoto,
  analyzeNutritionFromText,
  suggestNutritionTargets,
} from "@/lib/gemini";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ── Photo mode (FormData) ───────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const imageFile = formData.get("image") as File | null;

      if (!imageFile || !(imageFile instanceof File)) {
        return Response.json({ error: "image file is required" }, { status: 400 });
      }

      if (imageFile.size > MAX_IMAGE_SIZE) {
        return Response.json({ error: "Image must be under 10 MB" }, { status: 400 });
      }

      const mimeType = imageFile.type || "image/jpeg";
      if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        return Response.json(
          { error: `Unsupported image format. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}` },
          { status: 400 }
        );
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const result = await analyzeNutritionFromPhoto(base64, mimeType);
      return Response.json(result);
    }

    // ── Text / targets mode (JSON) ──────────────────────────────────────────
    const body = await request.json();

    if (body.action === "suggest_targets") {
      const targets = await suggestNutritionTargets(body.profile || {});
      return Response.json(targets);
    }

    if (!body.description || typeof body.description !== "string") {
      return Response.json(
        { error: "description (string) is required for text mode" },
        { status: 400 }
      );
    }

    const result = await analyzeNutritionFromText(body.description);
    return Response.json(result);
  } catch (error) {
    console.error("Nutrition analyze API error:", error);
    return Response.json(
      { error: "Failed to analyze nutrition" },
      { status: 500 }
    );
  }
}
