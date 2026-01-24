/**
 * Login form component
 * Initiates WorkOS authentication flow
 */

"use client";

import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleLogin = () => {
    // Redirect to WorkOS authorization URL
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">
            {error === "no_code" && "Authentication failed: No code received"}
            {error === "auth_failed" && "Authentication failed: Please try again"}
            {!["no_code", "auth_failed"].includes(error) &&
              "An error occurred during login"}
          </p>
        </div>
      )}

      <button
        onClick={handleLogin}
        className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-zinc-200 transition-colors"
      >
        Sign in with WorkOS
      </button>

      <p className="text-xs text-zinc-500 text-center mt-6">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
