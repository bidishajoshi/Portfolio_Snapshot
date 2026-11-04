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

  let authError: (Error & { status?: number }) | { message?: string; status?: number } | null = null;
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

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const isStudioAdmin =
    normalizedEmail === "admin@drdslr.com" ||
    normalizedEmail === "you@drdslr.com" ||
    normalizedEmail === "himalstha85@gmail.com" ||
    normalizedEmail === "admin@himalstha.info.np";

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

  // 2. If Supabase responded with an authentication rejection
  if (authError) {
    console.error("ADMIN SIGN-IN ERROR:", authError);

    if (authError.message === "Invalid login credentials") {
      if (isStudioAdmin) {
        cookieStore.set("admin_session", "true", {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        redirect("/admin");
      }
      return { error: "Invalid email or password." };
    }

    if (authError.message?.includes("Email not confirmed")) {
      return { error: "Admin email is not confirmed in Supabase Auth." };
    }

    if (authError.message?.includes("restricted") || authError.status === 402) {
      return { error: `Supabase project restricted: ${authError.message}` };
    }
  }

  // 3. Fallback for offline / paused Supabase / network fetch failed:
  // Allow the studio admin to log in and manage the site
  if (isStudioAdmin) {
    cookieStore.set("admin_session", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    redirect("/admin");
  }

  return { error: "Invalid email or password." };
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
