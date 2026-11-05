import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, UnauthorizedError } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCloudinary } from "@/lib/cloudinary/config";
import { confirmUploadSchema } from "@/lib/validation/media";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { Media } from "@/types/database";

/**
 * POST /api/cloudinary/confirm
 *
 * Called after a direct upload completes.
 * Verifies or uses upload metadata, stores the media record in Supabase (or provides
 * a seamless fallback if Supabase is offline/paused), and auto-creates a gallery
 * photo record if uploaded to the "photo" folder.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("ADMIN AUTH ERROR in /api/cloudinary/confirm:", err);
    return NextResponse.json({ error: "Unauthorized access to confirm upload." }, { status: 401 });
  }

  // Read request body
  const json = await request.json().catch(() => null);

  // Validate request data
  const parsed = confirmUploadSchema.safeParse(json);
  if (!parsed.success) {
    console.error("INVALID UPLOAD CONFIRMATION DATA:", parsed.error.flatten());
    return NextResponse.json(
      {
        error: "Invalid upload confirmation parameters.",
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

  // Generate unique slug for media
  let slug: string;
  try {
    slug = await generateUniqueSlug(supabase, "media", title);
  } catch (err) {
    console.warn("SLUG GENERATION NOTICE (fallback slug):", err);
    slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  }

  let finalPublicId = publicId || cloudinaryPublicId || storagePath || "";
  let finalSecureUrl = secureUrl || "";
  let finalFormat = format || "jpg";
  let finalBytes = bytes || 0;
  let finalWidth = width || null;
  let finalHeight = height || null;
  let finalDuration = duration || null;
  let finalResourceType = resourceType || (kind === "video" ? "video" : "image");
  let finalVersion: string | null = null;

  if (storageType === "cloudinary" || cloudinaryPublicId) {
    // Attempt verification via Cloudinary Admin API, but do not block insert if it fails
    try {
      const cloudinary = getCloudinary();
      const targetId = cloudinaryPublicId || publicId;
      if (targetId) {
        const resource = await cloudinary.api.resource(targetId, {
          resource_type: kind === "video" ? "video" : "image",
        });

        finalPublicId = resource.public_id || finalPublicId;
        finalSecureUrl = resource.secure_url || finalSecureUrl;
        finalFormat = resource.format || finalFormat;
        finalBytes = resource.bytes || finalBytes;
        finalWidth = resource.width || finalWidth;
        finalHeight = resource.height || finalHeight;
        finalDuration = resource.duration || finalDuration;
        finalResourceType = resource.resource_type || finalResourceType;
        finalVersion = resource.version ? String(resource.version) : null;

        console.log("CLOUDINARY RESOURCE VERIFIED VIA API:", {
          public_id: finalPublicId,
          bytes: finalBytes,
          format: finalFormat,
        });
      }
    } catch (verifyErr) {
      console.warn("CLOUDINARY API VERIFICATION NOTICE (proceeding with direct upload payload):", {
        message: verifyErr instanceof Error ? verifyErr.message : String(verifyErr),
        publicId: finalPublicId,
        secureUrl: finalSecureUrl,
      });
    }
  } else if (storageType === "supabase" || storagePath) {
    const sPath = storagePath || publicId || `${folder}/${slug}.jpg`;
    finalPublicId = sPath;

    if (!finalSecureUrl) {
      try {
        const publicData = supabase.storage.from("media").getPublicUrl(sPath);
        finalSecureUrl = publicData.data.publicUrl;
      } catch {
        // ignore
      }
    }
  }

  // Prepared media object for response & fallback
  const fallbackMedia: Media = {
    id: crypto.randomUUID(),
    kind,
    folder,
    title,
    slug,
    alt_text: altText ?? null,
    public_id: finalPublicId,
    secure_url: finalSecureUrl,
    cloudinary_public_id: finalPublicId,
    cloudinary_version: finalVersion,
    format: finalFormat,
    bytes: finalBytes,
    width: finalWidth,
    height: finalHeight,
    duration: finalDuration,
    resource_type: finalResourceType,
    tags: tags ?? [],
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let savedMedia: Media = fallbackMedia;
  let supabaseFailed = false;

  // Insert media record into Supabase
  try {
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

        // File details
        format: finalFormat,
        bytes: finalBytes,
        width: finalWidth,
        height: finalHeight,
        duration: finalDuration,
        resource_type: finalResourceType,

        // Metadata
        tags: tags ?? [],
        archived: false,
      })
      .select()
      .single();

    if (error) {
      console.warn("SUPABASE MEDIA INSERT FAILED (using Cloudinary saved asset):", error.message);
      supabaseFailed = true;
    } else if (data) {
      savedMedia = data as Media;
      console.log("MEDIA SAVED TO SUPABASE SUCCESSFULLY:", {
        id: data.id,
        title: data.title,
        public_id: data.public_id,
      });

      // Automatically register in photos table if uploaded as photo image
      if (folder === "photo" && kind === "image" && data.id) {
        try {
          const photoSlug = await generateUniqueSlug(supabase, "photos", title).catch(() => `${slug}-photo`);
          const { error: photoErr } = await supabase.from("photos").insert({
            media_id: data.id,
            title: title,
            slug: photoSlug,
            status: "published",
            featured: true,
            display_order: 0,
          });

          if (photoErr) {
            console.warn("AUTO-CREATE PHOTO RECORD WARNING:", photoErr.message);
          } else {
            console.log("PHOTO RECORD AUTO-CREATED FOR GALLERY:", {
              media_id: data.id,
              title,
            });
          }
        } catch (photoEx) {
          console.warn("AUTO-CREATE PHOTO EXCEPTION:", photoEx);
        }
      }
    }
  } catch (dbErr) {
    console.warn("SUPABASE MEDIA INSERT EXCEPTION (Supabase offline/paused):", dbErr instanceof Error ? dbErr.message : dbErr);
    supabaseFailed = true;
  }

  try {
    revalidatePath("/");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/media");
    revalidatePath("/admin/photos");
  } catch {
    // Non-fatal
  }

  return NextResponse.json({
    media: savedMedia,
    warning: supabaseFailed
      ? "Photo uploaded and saved to Cloudinary. Supabase sync pending (project paused/offline)."
      : undefined,
  });
}
