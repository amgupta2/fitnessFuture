/**
 * WorkOS authentication callback handler
 * Processes OAuth callback and creates user session
 */

import { authenticateWithCode } from "@/lib/workos";
import { setSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    // Authenticate with WorkOS
    const { user, accessToken } = await authenticateWithCode(code);

    // Get or create user in Convex
    await convex.mutation(api.users.getOrCreateUser, {
      workosId: user.id,
      email: user.email,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    });

    // Check if user has completed onboarding
    const hasCompletedOnboarding = await convex.query(
      api.users.hasCompletedOnboarding,
      {
        workosId: user.id,
      }
    );

    // Set session cookie
    await setSession({
      workosId: user.id,
      email: user.email,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      accessToken,
    });

    // Redirect based on onboarding status
    const redirectUrl = hasCompletedOnboarding ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
