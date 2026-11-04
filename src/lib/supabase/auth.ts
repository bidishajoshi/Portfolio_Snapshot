import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export class UnauthorizedError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_session")?.value;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!userError && user) {
      const { data: profile } = await supabase
        .from("admin_profile")
        .select("id, display_name")
        .eq("id", user.id)
        .maybeSingle();

      return {
        user,
        profile: profile ?? { id: user.id, display_name: "Himal Shrestha (Admin)" },
        supabase,
      };
    }
  } catch {
    // Supabase auth error fallback
  }

  // Fallback if admin_session cookie is set (e.g., when Supabase is paused or offline)
  if (adminCookie === "true" || adminCookie === "authenticated") {
    let fallbackSupabase: Awaited<ReturnType<typeof createClient>> | null = null;
    try {
      fallbackSupabase = await createClient();
    } catch {
      // Supabase offline
    }
    return {
      user: {
        id: "local-admin",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: "himalstha85@gmail.com",
      } as unknown as User,
      profile: { id: "local-admin", display_name: "Himal Shrestha (Admin)" },
      supabase: fallbackSupabase!,
    };
  }

  throw new UnauthorizedError("You must be signed in.");
}

/** Non-throwing variant for places that want to branch on admin status. */
export async function getAdminSession() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}
