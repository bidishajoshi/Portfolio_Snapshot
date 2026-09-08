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
  storageType: z.enum(["supabase", "cloudinary"]).optional().default("supabase"),
});

/**
 * POST /api/cloudinary/sign
 *
 * Admin-only. Generates direct client-to-storage upload credentials:
 * - Supabase Storage signed upload URL (supporting files up to 50 MB)
 * - Cloudinary signed upload parameters (legacy fallback)
 * File bytes never pass through the Next.js server.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { folder, filename, storageType } = parsed.data;

  // Supabase Storage direct signed upload URL (supports up to 50 MB per photo)
  if (storageType === "supabase") {
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
        { error: "Failed to generate storage upload URL.", details: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
  }

  // Cloudinary fallback
  try {
    const cloudinary = getCloudinary();
    const timestamp = Math.round(Date.now() / 1000);
    const cloudFolder = cloudinaryFolderFor(folder);

    const paramsToSign = { timestamp, folder: cloudFolder };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      storageType: "cloudinary",
      signature,
      timestamp,
      folder: cloudFolder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    console.error("CLOUDINARY SIGNING EXCEPTION:", err);
    return NextResponse.json(
      { error: "Failed to generate Cloudinary signature.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
