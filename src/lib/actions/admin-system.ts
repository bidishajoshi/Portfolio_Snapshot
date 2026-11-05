"use server";

import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function checkDatabaseHealth() {
  await requireAdmin();
  const start = Date.now();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("media").select("id").limit(1);
    if (error) {
      return { online: false, message: error.message, latencyMs: Date.now() - start };
    }
    revalidatePath("/admin");
    return { online: true, message: "Database active and connected.", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      online: false,
      message: err instanceof Error ? err.message : "Database connection failed",
      latencyMs: Date.now() - start,
    };
  }
}

/**
 * Attempts to trigger project restore via the Supabase Management API
 * if SUPABASE_ACCESS_TOKEN is configured in environment variables.
 */
export async function triggerDatabaseRestore(token?: string) {
  await requireAdmin();
  const accessToken = token || process.env.SUPABASE_ACCESS_TOKEN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];

  if (!projectRef || projectRef === "placeholder") {
    return { success: false, message: "Invalid project reference configured in environment." };
  }

  if (!accessToken) {
    return {
      success: false,
      message: "No Supabase Access Token provided. Please unpause in the Supabase Dashboard or provide a Personal Access Token.",
    };
  }

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/restore`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      revalidatePath("/admin");
      return {
        success: true,
        message: "Restore request accepted by Supabase! The database will be online in 2-3 minutes.",
      };
    }

    const body = await res.json().catch(() => ({}));
    return {
      success: false,
      message: body.message || `Supabase Management API returned status ${res.status}.`,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to connect to Supabase Management API.",
    };
  }
}
