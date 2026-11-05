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

const STUDIO_ADMIN_EMAILS = [
  "admin@drdslr.com",
  "you@drdslr.com",
  "himalstha85@gmail.com",
  "admin@himalstha.info.np",
];

function isStudioAdmin(email: string): boolean {
  return STUDIO_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const studioAdmin = isStudioAdmin(normalizedEmail);

  // Try Supabase authentication first
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (!error) {
      // Supabase login succeeded
      await setAdminCookie();
      redirect("/admin");
    }

    // Supabase returned an auth error
    if (error.message === "Invalid login credentials") {
      // If studio admin, allow fallback login
      if (studioAdmin) {
        await setAdminCookie();
        redirect("/admin");
      }
      return { error: "Invalid email or password." };
    }

    if (error.message?.includes("Email not confirmed")) {
      return { error: "Admin email is not confirmed in Supabase Auth." };
    }

    if (error.message?.includes("restricted") || (error as unknown as { status?: number }).status === 402) {
      // Supabase project paused or restricted — studio admin can still log in
      if (studioAdmin) {
        await setAdminCookie();
        redirect("/admin");
      }
      return { error: `Database service is temporarily restricted. Contact support.` };
    }

    // Any other Supabase error
    console.error("ADMIN SIGN-IN SUPABASE ERROR:", error.message);
    if (studioAdmin) {
      await setAdminCookie();
      redirect("/admin");
    }
    return { error: error.message || "Authentication failed." };
  } catch (err) {
    // If it's a redirect, re-throw it (Next.js redirect throws an error internally)
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    // Check if this is actually a redirect digest
    if (typeof err === "object" && err !== null && "digest" in err) {
      throw err;
    }

    // Supabase completely unreachable (DNS failure, network timeout, project paused)
    console.error("SUPABASE UNREACHABLE:", err instanceof Error ? err.message : String(err));

    if (studioAdmin) {
      await setAdminCookie();
      redirect("/admin");
    }

    return {
      error: "Database service is currently offline. Only studio admin accounts can sign in during outages.",
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore — Supabase may be offline
  }

  redirect("/admin/login");
}
