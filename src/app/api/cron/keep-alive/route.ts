import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCloudinary } from "@/lib/cloudinary/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/keep-alive
 *
 * Automated heartbeat endpoint called daily by Vercel Cron and GitHub Actions.
 * 1. Pings Supabase with an active database query to reset the 7-day inactivity timer.
 * 2. If Supabase is paused and SUPABASE_ACCESS_TOKEN is configured, attempts to auto-restore.
 * 3. Verifies Cloudinary API health.
 *
 * This guarantees Supabase free-tier projects never pause automatically.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Protect against unauthorized spam if CRON_SECRET is configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && searchParams.get("key") !== cronSecret) {
    // In production Vercel sends `Authorization: Bearer <CRON_SECRET>`
    // For manual triggers or external pings, accept ?key=<CRON_SECRET>
    // If CRON_SECRET is not set, allow execution so keep-alive still functions
    if (process.env.NODE_ENV === "production" && cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();
  const results: {
    timestamp: string;
    durationMs: number;
    supabase: {
      status: "online" | "paused" | "error";
      latencyMs?: number;
      message?: string;
      autoResumeAttempted?: boolean;
      autoResumeSuccess?: boolean;
    };
    cloudinary: {
      status: "online" | "error";
      latencyMs?: number;
      resourcesCount?: number;
      message?: string;
    };
  } = {
    timestamp: new Date().toISOString(),
    durationMs: 0,
    supabase: { status: "error" },
    cloudinary: { status: "error" },
  };

  // 1. Supabase Keep-Alive Query
  const supaStart = Date.now();
  try {
    const supabase = createAdminClient();
    // Lightweight database query that counts toward activity
    const { error } = await supabase
      .from("media")
      .select("id")
      .limit(1);

    if (error) {
      results.supabase = {
        status: "error",
        latencyMs: Date.now() - supaStart,
        message: error.message,
      };
    } else {
      results.supabase = {
        status: "online",
        latencyMs: Date.now() - supaStart,
        message: "Active query recorded; 7-day inactivity timer reset.",
      };
    }
  } catch (err) {
    const isDnsError =
      err instanceof Error &&
      (err.message.includes("ENOTFOUND") ||
        err.message.includes("fetch failed") ||
        err.message.includes("could not be resolved"));

    results.supabase = {
      status: isDnsError ? "paused" : "error",
      latencyMs: Date.now() - supaStart,
      message: err instanceof Error ? err.message : String(err),
    };

    // Attempt auto-restore via Supabase Management API if token is provided
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

    if (accessToken && projectRef && projectRef !== "placeholder") {
      results.supabase.autoResumeAttempted = true;
      try {
        const restoreRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        results.supabase.autoResumeSuccess = restoreRes.ok;
      } catch (autoErr) {
        console.warn("Auto-restore trigger failed:", autoErr);
        results.supabase.autoResumeSuccess = false;
      }
    }
  }

  // 2. Cloudinary Health Ping
  const cloudStart = Date.now();
  try {
    const cloudinary = getCloudinary();
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: "dr-dslr",
      max_results: 5,
    });
    results.cloudinary = {
      status: "online",
      latencyMs: Date.now() - cloudStart,
      resourcesCount: res.resources?.length ?? 0,
      message: "Cloudinary CDN and API responsive.",
    };
  } catch (cloudErr) {
    results.cloudinary = {
      status: "error",
      latencyMs: Date.now() - cloudStart,
      message: cloudErr instanceof Error ? cloudErr.message : String(cloudErr),
    };
  }

  results.durationMs = Date.now() - startTime;

  const isHealthy = results.supabase.status === "online" && results.cloudinary.status === "online";
  return NextResponse.json(results, { status: isHealthy ? 200 : 207 });
}
