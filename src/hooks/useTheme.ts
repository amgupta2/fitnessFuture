/**
 * Theme hook for dark/light mode
 */

"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useTheme() {
  const user = useCurrentUser();
  const updateProfile = useMutation(api.users.updateUserProfile);
  const [isDark, setIsDark] = useState(true);

  // Initialize theme from user preference
  useEffect(() => {
    if (user?.preferences?.darkMode !== undefined) {
      setIsDark(user.preferences.darkMode);
      applyTheme(user.preferences.darkMode);
    } else {
      // Default to dark mode
      applyTheme(true);
    }
  }, [user?.preferences?.darkMode]);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);

    // Save to database
    if (user) {
      await updateProfile({
        userId: user._id,
        preferences: {
          ...user.preferences,
          darkMode: newTheme,
        },
      });
    }
  };

  return { isDark, toggleTheme };
}
