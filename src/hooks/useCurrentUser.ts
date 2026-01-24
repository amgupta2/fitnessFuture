/**
 * Hook to get current user from Convex
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [workosId, setWorkosId] = useState<string | null>(null);

  useEffect(() => {
    // Get workosId from session cookie
    const getWorkosId = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data?.workosId) {
          setWorkosId(data.workosId);
        }
      } catch (error) {
        console.error("Failed to get user session:", error);
      }
    };

    getWorkosId();
  }, []);

  const user = useQuery(
    api.users.getUserByWorkosId,
    workosId ? { workosId } : "skip"
  );

  return user;
}
