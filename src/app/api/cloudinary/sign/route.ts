import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError } from "@/lib/supabase/auth";
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
});

/**
 * POST /api/cloudinary/sign
 *
 * Admin-only. Returns a short-lived signature the browser uses to upload
 * directly to Cloudinary (unsigned browser uploads never touch our
 * server's bandwidth, but still require a signature so randoms can't
 * upload to our account). CLOUDINARY_API_SECRET is used here, server-side,
 * and never returned to the client.
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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const cloudinary = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = cloudinaryFolderFor(parsed.data.folder);

  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
