/**
 * Builds optimized Cloudinary delivery URLs from a public_id. Safe to use
 * in Client Components — this only needs the CLOUD NAME (public), never
 * the API secret. Every public-facing <img>/<video> should go through
 * this so we always request auto format/quality and the right size
 * instead of full-resolution originals (spec section 39).
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eyrwzaapdhjljaxnuzek.supabase.co";

export interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "thumb" | "scale" | "original";
  gravity?: "auto" | "face" | "center";
  quality?: "auto" | "original" | number;
}

export function cloudinaryImageUrl(
  publicId: string,
  { width, height, crop = "limit", gravity = "auto", quality = "auto" }: CloudinaryImageOptions = {}
): string {
  if (!publicId) return "";

  // 1. Direct absolute URL (e.g. Supabase Storage public URL or external CDN)
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    // If it was already converted to a render URL, revert it back to public object URL to prevent 400 on large files
    if (publicId.includes("/storage/v1/render/image/public/media/")) {
      return publicId.replace("/storage/v1/render/image/public/media/", "/storage/v1/object/public/media/").split("?")[0];
    }
    return publicId;
  }

  // 2. Supabase Storage relative path (e.g. "photo/xxx.jpg", "hero/xxx.jpg", "media/xxx.jpg")
  if (
    publicId.startsWith("photo/") ||
    publicId.startsWith("album/") ||
    publicId.startsWith("story/") ||
    publicId.startsWith("hero/") ||
    publicId.startsWith("profile/") ||
    publicId.startsWith("service/") ||
    publicId.startsWith("testimonial/") ||
    publicId.startsWith("film/") ||
    publicId.startsWith("other/") ||
    publicId.startsWith("media/")
  ) {
    const objectPath = publicId.startsWith("media/") ? publicId.slice("media/".length) : publicId;
    return `${SUPABASE_URL}/storage/v1/object/public/media/${objectPath}`;
  }

  // 3. Cloudinary public ID
  if (!CLOUD_NAME) {
    return publicId;
  }

  const transforms = ["f_auto", quality === "original" ? "q_100" : `q_${quality}`];
  if (width && crop !== "original") transforms.push(`w_${width}`);
  if (height && crop !== "original") transforms.push(`h_${height}`);
  if ((width || height) && crop !== "original") transforms.push(`c_${crop}`);
  if (crop === "fill" || crop === "thumb") transforms.push(`g_${gravity}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}

/** Responsive size helper */
export function responsiveMediaUrl(
  mediaOrId: string | { secure_url?: string | null; cloudinary_public_id?: string | null; public_id?: string | null },
  variant: "thumb" | "medium" | "large" | "original" = "medium"
): string {
  const id = typeof mediaOrId === "string"
    ? mediaOrId
    : mediaOrId.secure_url || mediaOrId.cloudinary_public_id || mediaOrId.public_id || "";

  if (!id) return "";

  // Supabase Storage URLs are served directly via public object storage
  if (
    id.startsWith("http://") ||
    id.startsWith("https://") ||
    id.startsWith("photo/") ||
    id.startsWith("hero/") ||
    id.startsWith("album/") ||
    id.startsWith("story/") ||
    id.startsWith("profile/") ||
    id.startsWith("service/") ||
    id.startsWith("testimonial/") ||
    id.startsWith("film/") ||
    id.startsWith("other/") ||
    id.startsWith("media/")
  ) {
    return cloudinaryImageUrl(id);
  }

  switch (variant) {
    case "thumb":
      return cloudinaryImageUrl(id, { width: 400, quality: 80, crop: "fill" });
    case "medium":
      return cloudinaryImageUrl(id, { width: 1200, quality: 85, crop: "limit" });
    case "large":
      return cloudinaryImageUrl(id, { width: 2400, quality: 90, crop: "limit" });
    case "original":
      return cloudinaryImageUrl(id, { crop: "original", quality: "original" });
  }
}

/** Generates a `srcset` string across common breakpoints for responsive <img>. */
export function cloudinarySrcSet(publicId: string, widths: number[] = [400, 800, 1200, 1600, 2000]): string {
  return widths
    .map((w) => `${cloudinaryImageUrl(publicId, { width: w })} ${w}w`)
    .join(", ");
}

export function cloudinaryVideoUrl(publicId: string): string {
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }
  if (!CLOUD_NAME) {
    return publicId;
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${publicId}`;
}

export function cloudinaryVideoThumbUrl(publicId: string, width = 800): string {
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }
  if (!CLOUD_NAME) {
    return publicId;
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto,w_${width},c_limit/${publicId}.jpg`;
}
