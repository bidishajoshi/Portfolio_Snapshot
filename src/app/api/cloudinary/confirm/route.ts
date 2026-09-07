import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
    storageType,
    storagePath,
    cloudinaryPublicId,
    publicId,
    secureUrl,
    resourceType,
    format,
    bytes,
    width,
    height,
    duration,
    kind,
    folder,
    title,
    altText,
    tags,
  } = parsed.data;

  // Create Supabase admin client
  const supabase = createAdminClient();

  // Generate unique slug
  let slug: string;
  try {
    slug = await generateUniqueSlug(supabase, "media", title);
  } catch (err) {
    console.error("SLUG GENERATION ERROR:", err);
    return NextResponse.json(
      {
        error: "Could not generate a unique media slug.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  let finalPublicId = publicId || storagePath || cloudinaryPublicId || "";
  let finalSecureUrl = secureUrl;
  let finalFormat = format || "jpg";
  let finalBytes = bytes || 0;
  let finalWidth = width || null;
  let finalHeight = height || null;
  let finalDuration = duration || null;
  let finalResourceType = resourceType || (kind === "video" ? "video" : "image");
  let finalVersion: string | null = null;

  if (storageType === "supabase" || (!cloudinaryPublicId && (storagePath || secureUrl))) {
    const sPath = storagePath || publicId || (secureUrl ? secureUrl.split("/media/").pop() : undefined) || `${folder}/${slug}.jpg`;
    finalPublicId = sPath;

    if (!finalSecureUrl) {
      const publicData = supabase.storage.from("media").getPublicUrl(sPath);
      finalSecureUrl = publicData.data.publicUrl;
    }

    if (!finalFormat && sPath.includes(".")) {
      finalFormat = sPath.split(".").pop()?.toLowerCase() || "jpg";
    }

    console.log("CONFIRMING SUPABASE STORAGE ASSET:", {
      path: sPath,
      url: finalSecureUrl,
      bytes: finalBytes,
      width: finalWidth,
      height: finalHeight,
      format: finalFormat,
    });
  } else {
    // Cloudinary verification
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

    try {
      const resource = await cloudinary.api.resource(cloudinaryPublicId!, {
        resource_type: kind === "video" ? "video" : "image",
      });

      finalPublicId = resource.public_id;
      finalSecureUrl = resource.secure_url ?? secureUrl ?? null;
      finalFormat = resource.format ?? format ?? "jpg";
      finalBytes = resource.bytes ?? bytes ?? 0;
      finalWidth = resource.width ?? width ?? null;
      finalHeight = resource.height ?? height ?? null;
      finalDuration = resource.duration ?? duration ?? null;
      finalResourceType = resource.resource_type ?? resourceType ?? kind;
      finalVersion = resource.version ? String(resource.version) : null;

      console.log("CLOUDINARY RESOURCE VERIFIED:", {
        public_id: resource.public_id,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
      });
    } catch (err) {
      console.error("CLOUDINARY VERIFICATION ERROR:", err);
      return NextResponse.json(
        {
          error: "Could not verify this upload with Cloudinary. Please try again.",
        },
        { status: 422 }
      );
    }
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

      // Provider identifiers
      public_id: finalPublicId,
      secure_url: finalSecureUrl,
      cloudinary_public_id: finalPublicId,
      cloudinary_version: finalVersion,

      // File information (up to 50 MB)
      format: finalFormat,
      bytes: finalBytes,
      width: finalWidth,
      height: finalHeight,
      duration: finalDuration,
      resource_type: finalResourceType,

      // Tags & metadata
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

  // If this asset was uploaded as a photo, automatically register it in the photos table so it appears in the gallery
  if (folder === "photo" && kind === "image" && data?.id) {
    try {
      const photoSlug = await generateUniqueSlug(supabase, "photos", title);
      const { error: photoErr } = await supabase.from("photos").insert({
        media_id: data.id,
        title: title,
        slug: photoSlug,
        status: "published",
        published: true,
        is_published: true,
        featured: true,
        is_featured: true,
        is_visible: true,
        display_order: 0,
      });
      if (photoErr) {
        console.error("FAILED TO AUTO-CREATE PHOTO RECORD:", photoErr);
      } else {
        console.log("PHOTO AUTO-CREATED FOR GALLERY:", title);
      }
    } catch (err) {
      console.error("ERROR AUTO-CREATING PHOTO RECORD:", err);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/media");

  return NextResponse.json({
    media: data,
  });
}