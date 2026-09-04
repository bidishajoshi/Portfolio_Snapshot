import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCloudinary } from "@/lib/cloudinary/config";
import { confirmUploadSchema } from "@/lib/validation/media";
import { generateUniqueSlug } from "@/lib/utils/slug";

/**
 * POST /api/cloudinary/confirm
 *
 * Called after a direct-to-Cloudinary upload completes.
 * Verifies the uploaded asset with Cloudinary and then
 * saves the media record in Supabase.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: err.message },
        { status: 401 }
      );
    }

    console.error("ADMIN AUTH ERROR:", err);

    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  // Read request body
  const json = await request.json().catch(() => null);

  // Validate request data
  const parsed = confirmUploadSchema.safeParse(json);

  if (!parsed.success) {
    console.error(
      "INVALID UPLOAD DATA:",
      parsed.error.flatten()
    );

    return NextResponse.json(
      {
        error: "Invalid upload data.",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const {
    cloudinaryPublicId,
    secureUrl,
    resourceType,
    kind,
    folder,
    title,
    altText,
    tags,
  } = parsed.data;

  // Get Cloudinary client
  let cloudinary;

  try {
    cloudinary = getCloudinary();
  } catch (err) {
    console.error("CLOUDINARY CONFIGURATION ERROR:", err);

    return NextResponse.json(
      {
        error: "Cloudinary is not configured correctly.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  // Verify asset exists in Cloudinary
  let resource;

  try {
    resource = await cloudinary.api.resource(
      cloudinaryPublicId,
      {
        resource_type: kind === "video" ? "video" : "image",
      }
    );

    console.log("CLOUDINARY RESOURCE VERIFIED:", {
      public_id: resource.public_id,
      resource_type: resource.resource_type,
      format: resource.format,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
    });
  } catch (err) {
    console.error(
      "CLOUDINARY VERIFICATION ERROR:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Could not verify this upload with Cloudinary. Please try again.",
      },
      { status: 422 }
    );
  }

  // Create Supabase admin client
  const supabase = createAdminClient();

  // Generate unique slug
  let slug;

  try {
    slug = await generateUniqueSlug(
      supabase,
      "media",
      title
    );
  } catch (err) {
    console.error("SLUG GENERATION ERROR:", err);

    return NextResponse.json(
      {
        error: "Could not generate a unique media slug.",
        details:
          err instanceof Error
            ? err.message
            : String(err),
      },
      { status: 500 }
    );
  }

  // Save media record to Supabase
  const { data, error } = await supabase
    .from("media")
    .insert({
      kind,
      folder,
      title,
      slug,
      alt_text: altText ?? null,

      // Cloudinary information
      public_id: resource.public_id,
      secure_url: resource.secure_url ?? secureUrl ?? null,
      cloudinary_public_id: resource.public_id,
      cloudinary_version: String(resource.version),

      // File information
      format: resource.format ?? null,
      bytes: resource.bytes ?? null,
      width: resource.width ?? null,
      height: resource.height ?? null,
      duration: resource.duration ?? null,
      resource_type: resource.resource_type ?? resourceType ?? kind,

      // Tags
      tags: tags ?? [],
    })
    .select()
    .single();

  // IMPORTANT:
  // Show the real Supabase error in the terminal.
  if (error) {
    console.error(
      "SUPABASE MEDIA INSERT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not save this photo.",
        details: error.message,
        code: error.code,
        hint: error.hint,
        detailsFromSupabase: error.details,
      },
      { status: 500 }
    );
  }

  console.log(
    "MEDIA SAVED SUCCESSFULLY:",
    data
  );

  return NextResponse.json({
    media: data,
  });
}