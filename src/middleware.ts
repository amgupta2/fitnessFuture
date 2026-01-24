/**
 * Next.js middleware
 * Handles authentication and onboarding redirects
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth/login", "/api/auth/callback"];
const onboardingPath = "/onboarding";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("fitness_session");

  // Redirect to login if no session
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Parse session
  try {
    const session = JSON.parse(sessionCookie.value);

    // TODO: Check if user has completed onboarding via Convex query
    // For now, allow all authenticated users through
    // In production, you'd check hasCompletedOnboarding here

    return NextResponse.next();
  } catch (error) {
    // Invalid session, redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
