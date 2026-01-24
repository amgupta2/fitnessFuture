/**
 * Session management utilities
 * Handles secure session cookies with iron-session
 */

import { cookies } from "next/headers";
import { verifySession } from "./workos";

const SESSION_COOKIE_NAME = "fitness_session";

export interface SessionData {
  workosId: string;
  email: string;
  name?: string;
  accessToken: string;
}

/**
 * Set session cookie
 */
export async function setSession(data: SessionData) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value) as SessionData;
    return session;
  } catch (error) {
    // Invalid session format - return null
    return null;
  }
}

/**
 * Clear session cookie
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session;
}

/**
 * Require authentication
 * Throws if no session exists
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
