/**
 * WorkOS authentication client
 * Handles SSO, email/password authentication
 */

import { WorkOS } from "@workos-inc/node";

if (!process.env.WORKOS_API_KEY) {
  throw new Error("WORKOS_API_KEY is not set");
}

if (!process.env.WORKOS_CLIENT_ID) {
  throw new Error("WORKOS_CLIENT_ID is not set");
}

export const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID;
export const WORKOS_REDIRECT_URI =
  process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI ||
  "http://localhost:3000/api/auth/callback";

/**
 * Get authorization URL for WorkOS
 */
export function getAuthorizationUrl(state?: string) {
  return workos.userManagement.getAuthorizationUrl({
    provider: "authkit",
    clientId: WORKOS_CLIENT_ID,
    redirectUri: WORKOS_REDIRECT_URI,
    state: state || "",
  });
}

/**
 * Authenticate user with WorkOS code
 */
export async function authenticateWithCode(code: string) {
  const { user, accessToken } = await workos.userManagement.authenticateWithCode({
    clientId: WORKOS_CLIENT_ID,
    code,
  });

  return { user, accessToken };
}

/**
 * Get user from access token
 */
export async function getUserFromToken(accessToken: string) {
  return await workos.userManagement.getUser(accessToken);
}

/**
 * Verify session and return user
 */
export async function verifySession(sessionToken: string) {
  try {
    const user = await getUserFromToken(sessionToken);
    return user;
  } catch (error) {
    return null;
  }
}
