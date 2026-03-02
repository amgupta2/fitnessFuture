"use client";

import { useEffect, useState } from "react";

/**
 * Returns true if the current viewport matches the given CSS media query.
 * Initializes to false (safe for SSR), then syncs on the client.
 *
 * Usage:
 *   const isMobile = useMediaQuery("(max-width: 1023px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
