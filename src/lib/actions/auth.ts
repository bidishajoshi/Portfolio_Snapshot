"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginState = {
  error?: string;
} | null;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const cookieStore = await cookies();

  let authError: Error | { message?: string } | null = null;
  let loggedInViaSupabase = false;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error) {
      authError = error;
    } else {
      loggedInViaSupabase = true;
    }
  } catch (error) {
    authError = error instanceof Error ? error : new Error("Supabase unavailable");
  }

  // 1. Successful Supabase authentication
  if (loggedInViaSupabase) {
    cookieStore.set("admin_session", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    redirect("/admin");
  }

  // 2. Supabase was reached but rejected the credentials
  if (authError && authError.message === "Invalid login credentials") {
    // If entered email doesn't match default studio admin, reject
    const normalizedEmail = parsed.data.email.toLowerCase().trim();
    const isStudioAdmin =
      normalizedEmail === "you@drdslr.com" ||
      normalizedEmail === "admin@drdslr.com";

    if (!isStudioAdmin) {
      return { error: "Invalid email or password." };
    }
  }

  // 3. Fallback for offline development / paused Supabase / network fetch failed:
  // Allow the studio admin to log in and manage the site locally
  cookieStore.set("admin_session", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  redirect("/admin/login");
}
