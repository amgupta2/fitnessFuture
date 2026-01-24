/**
 * Login page
 * WorkOS authentication entry point
 */

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  // Redirect if already logged in
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Next-Gen Fitness
          </h1>
          <p className="text-zinc-400">
            Where training data, intelligence, and coaching merge
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
