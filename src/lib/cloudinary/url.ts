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

  // 1. Local static relative assets (e.g. "/images/placeholder/hero.jpg" or "data:...")
  if (publicId.startsWith("/") || publicId.startsWith("data:")) {
    return publicId;
  }

  const transforms: string[] = ["f_auto", quality === "original" ? "q_100" : `q_${quality}`];
  if (width && crop !== "original") transforms.push(`w_${width}`);
  if (height && crop !== "original") transforms.push(`h_${height}`);
  if ((width || height) && crop !== "original") transforms.push(`c_${crop}`);
  if ((crop === "fill" || crop === "thumb") && gravity) transforms.push(`g_${gravity}`);
  const transformStr = transforms.join(",");

  // 2. Direct Cloudinary absolute URL (e.g. https://res.cloudinary.com/cloudname/image/upload/...)
  if (publicId.includes("res.cloudinary.com") && publicId.includes("/image/upload/")) {
    const [baseUrl, rest] = publicId.split("/image/upload/");
    // Clean any existing transformation string preceding version ("v12345") or public_id
    const cleanPath = rest.replace(
      /^(?:[a-zA-Z0-9_,-]+(?:\:[a-zA-Z0-9_,-]+)?\/)*(v\d+.*|[^/]+)$/,
      "$1"
    );
    return `${baseUrl}/image/upload/${transformStr}/${cleanPath}`;
  }

  // 2.5. Already an optimized render endpoint
  if (publicId.startsWith("/api/media/render")) {
    return publicId;
  }

  // 3. Supabase Storage URLs or relative paths (photo/..., hero/..., album/..., etc.)
  let cleanedId = publicId;

  // Extract objectPath if it's a full Supabase URL or relative path
  if (cleanedId.includes("/storage/v1/object/public/media/")) {
    cleanedId = cleanedId.split("/storage/v1/object/public/media/")[1].split("?")[0];
  } else if (cleanedId.includes("/storage/v1/render/image/public/media/")) {
    cleanedId = cleanedId.split("/storage/v1/render/image/public/media/")[1].split("?")[0];
  }

  const isSupabaseFolder =
    cleanedId.startsWith("photo/") ||
    cleanedId.startsWith("album/") ||
    cleanedId.startsWith("story/") ||
    cleanedId.startsWith("hero/") ||
    cleanedId.startsWith("profile/") ||
    cleanedId.startsWith("service/") ||
    cleanedId.startsWith("testimonial/") ||
    cleanedId.startsWith("film/") ||
    cleanedId.startsWith("other/") ||
    cleanedId.startsWith("media/");

  if (isSupabaseFolder) {
    const objectPath = cleanedId.startsWith("media/")
      ? cleanedId.slice("media/".length)
      : cleanedId;

    // Use Next.js high-speed WebP image renderer with Sharp (supports 50MB files, never 400s)
    const targetWidth = width || 1200;
    const targetQuality = typeof quality === "number" ? quality : 80;
    return `/api/media/render?path=${encodeURIComponent(objectPath)}&width=${targetWidth}&quality=${targetQuality}`;
  }

  // 4. Other direct absolute URLs (e.g. external CDN)
  if (cleanedId.startsWith("http://") || cleanedId.startsWith("https://")) {
    return cleanedId;
  }

  // 5. Cloudinary public ID
  if (!CLOUD_NAME) {
    return cleanedId;
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${cleanedId}`;
}

/** Responsive size helper */
export function responsiveMediaUrl(
  mediaOrId: string | { secure_url?: string | null; cloudinary_public_id?: string | null; public_id?: string | null },
  variant: "thumb" | "medium" | "large" | "original" = "medium"
): string {
  const id = typeof mediaOrId === "string"
    ? mediaOrId
    : mediaOrId.cloudinary_public_id || mediaOrId.public_id || mediaOrId.secure_url || "";

  if (!id) return "";

  switch (variant) {
    case "thumb":
      return cloudinaryImageUrl(id, { width: 400, quality: 80, crop: "fill" });
    case "medium":
      return cloudinaryImageUrl(id, { width: 800, quality: 80, crop: "limit" });
    case "large":
      return cloudinaryImageUrl(id, { width: 1600, quality: 85, crop: "limit" });
    case "original":
      // Capped high-res delivery version to prevent 50MB browser hang
      return cloudinaryImageUrl(id, { width: 2000, quality: 85, crop: "limit" });
  }
}

/** Generates a `srcset` string across common breakpoints for responsive <img>. */
export function cloudinarySrcSet(publicId: string, widths: number[] = [400, 800, 1200, 1600]): string {
  if (!publicId || publicId.startsWith("data:")) return "";

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
