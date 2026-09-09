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

  const transforms: string[] = ["f_auto", quality === "original" ? "q_100" : `q_${quality}`];
  if (width && crop !== "original") transforms.push(`w_${width}`);
  if (height && crop !== "original") transforms.push(`h_${height}`);
  if ((width || height) && crop !== "original") transforms.push(`c_${crop}`);
  if ((crop === "fill" || crop === "thumb") && gravity) transforms.push(`g_${gravity}`);
  const transformStr = transforms.join(",");

  // 1. Direct Cloudinary absolute URL (e.g. https://res.cloudinary.com/cloudname/image/upload/...)
  if (publicId.includes("res.cloudinary.com") && publicId.includes("/image/upload/")) {
    const [baseUrl, rest] = publicId.split("/image/upload/");
    // Clean any existing transformation string preceding version ("v12345") or public_id
    const cleanPath = rest.replace(
      /^(?:[a-zA-Z0-9_,-]+(?:\:[a-zA-Z0-9_,-]+)?\/)*(v\d+.*|[^/]+)$/,
      "$1"
    );
    return `${baseUrl}/image/upload/${transformStr}/${cleanPath}`;
  }

  // 2. Normalize Supabase render URL back to object public URL first
  let cleanedId = publicId;
  if (cleanedId.includes("/storage/v1/render/image/public/media/")) {
    cleanedId = cleanedId
      .replace("/storage/v1/render/image/public/media/", "/storage/v1/object/public/media/")
      .split("?")[0];
  }

  // 3. Supabase Storage relative paths (e.g. "photo/xxx.jpg", "hero/xxx.jpg", "media/xxx.jpg")
  if (
    cleanedId.startsWith("photo/") ||
    cleanedId.startsWith("album/") ||
    cleanedId.startsWith("story/") ||
    cleanedId.startsWith("hero/") ||
    cleanedId.startsWith("profile/") ||
    cleanedId.startsWith("service/") ||
    cleanedId.startsWith("testimonial/") ||
    cleanedId.startsWith("film/") ||
    cleanedId.startsWith("other/") ||
    cleanedId.startsWith("media/")
  ) {
    const objectPath = cleanedId.startsWith("media/")
      ? cleanedId.slice("media/".length)
      : cleanedId;
    const supabaseUrl = `${SUPABASE_URL}/storage/v1/object/public/media/${objectPath}`;

    if (CLOUD_NAME) {
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformStr}/${encodeURIComponent(supabaseUrl)}`;
    }
    return supabaseUrl;
  }

  // 4. Other direct absolute URLs (e.g. Supabase Storage public URL or external CDN)
  if (cleanedId.startsWith("http://") || cleanedId.startsWith("https://")) {
    if (CLOUD_NAME && !cleanedId.includes("res.cloudinary.com")) {
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformStr}/${encodeURIComponent(cleanedId)}`;
    }
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
    : mediaOrId.secure_url || mediaOrId.cloudinary_public_id || mediaOrId.public_id || "";

  if (!id) return "";

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
export function cloudinarySrcSet(publicId: string, widths: number[] = [640, 960, 1280, 1600, 1920, 2560]): string {
  if (!publicId) return "";
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
