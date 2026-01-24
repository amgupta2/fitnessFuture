/**
 * Login redirect handler
 * Redirects to WorkOS authorization URL
 */

import { getAuthorizationUrl } from "@/lib/workos";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authUrl = getAuthorizationUrl();
  return NextResponse.redirect(authUrl);
}
