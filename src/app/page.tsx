/**
 * Home page
 * Redirects to dashboard if authenticated, otherwise to login
 */

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
