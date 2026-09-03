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

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) return { error: "Invalid email or password." };

    cookieStore.set("admin_session", "true", { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    redirect("/admin");
  } catch {
    return { error: "Unable to sign in right now. Check Supabase configuration." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (e) {
    // ignore
  }

  redirect("/admin/login");
}

