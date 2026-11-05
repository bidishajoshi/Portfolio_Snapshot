import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCloudinary, cloudinaryFolderFor } from "@/lib/cloudinary/config";
import { z } from "zod";

const bodySchema = z.object({
  folder: z.enum([
    "photo",
    "video",
    "hero",
    "profile",
    "album",
    "story",
    "film",
    "service",
    "testimonial",
    "other",
  ]),
  filename: z.string().optional(),
  contentType: z.string().optional(),
  storageType: z.enum(["cloudinary", "supabase"]).optional().default("cloudinary"),
});

/**
 * POST /api/cloudinary/sign
 *
 * Admin-only. Generates direct client-to-Cloudinary signed upload parameters.
 * File bytes stream directly from the browser to Cloudinary without loading the server.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("ADMIN AUTH ERROR in /api/cloudinary/sign:", err);
    return NextResponse.json({ error: "Unauthorized access to media upload." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request parameters.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { folder, filename, storageType } = parsed.data;

  // Primary: Cloudinary signed direct upload
  if (storageType === "cloudinary") {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("CLOUDINARY CONFIG ERROR: Missing credentials in environment variables", {
        hasCloudName: !!cloudName,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
      });
      return NextResponse.json(
        {
          error: "Cloudinary configuration is incomplete on the server.",
          details: `Missing: ${[!cloudName && "CLOUDINARY_CLOUD_NAME", !apiKey && "CLOUDINARY_API_KEY", !apiSecret && "CLOUDINARY_API_SECRET"].filter(Boolean).join(", ")}. Please configure these in your deployment settings.`,
        },
        { status: 500 }
      );
    }

    try {
      const cloudinary = getCloudinary();
      const timestamp = Math.round(Date.now() / 1000);
      const cloudFolder = cloudinaryFolderFor(folder);

      const paramsToSign = {
        folder: cloudFolder,
        timestamp,
      };

      const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

      console.log("CLOUDINARY SIGNATURE GENERATED SUCCESSFULLY:", {
        folder: cloudFolder,
        timestamp,
        cloudName,
      });

      return NextResponse.json({
        storageType: "cloudinary",
        signature,
        timestamp,
        folder: cloudFolder,
        apiKey,
        cloudName,
      });
    } catch (err) {
      console.error("CLOUDINARY SIGNING EXCEPTION:", err);
      return NextResponse.json(
        {
          error: "Failed to generate Cloudinary signature.",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }
  }

  // Secondary/fallback: Supabase Storage direct signed upload URL
  try {
    const supabase = createAdminClient();
    const rawExt = filename ? filename.split(".").pop()?.toLowerCase() : undefined;
    const ext = rawExt && /^[a-z0-9]+$/.test(rawExt) ? rawExt : "jpg";
    const uniqueId = crypto.randomUUID();
    const storagePath = `${folder}/${Date.now()}-${uniqueId}.${ext}`;

    const { data, error } = await supabase.storage
      .from("media")
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("SUPABASE SIGNED UPLOAD URL ERROR:", error);
      return NextResponse.json(
        { error: "Could not create signed upload URL.", details: error?.message },
        { status: 500 }
      );
    }

    const publicData = supabase.storage.from("media").getPublicUrl(storagePath);

    return NextResponse.json({
      storageType: "supabase",
      signedUrl: data.signedUrl,
      path: storagePath,
      token: data.token,
      bucket: "media",
      publicUrl: publicData.data.publicUrl,
    });
  } catch (err) {
    console.error("SUPABASE SIGNING EXCEPTION:", err);
    return NextResponse.json(
      {
        error: "Failed to generate storage upload URL.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
