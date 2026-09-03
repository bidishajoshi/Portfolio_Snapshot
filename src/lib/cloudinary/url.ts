/**
 * Builds optimized Cloudinary delivery URLs from a public_id. Safe to use
 * in Client Components — this only needs the CLOUD NAME (public), never
 * the API secret. Every public-facing <img>/<video> should go through
 * this so we always request auto format/quality and the right size
 * instead of full-resolution originals (spec section 39).
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "thumb" | "scale";
  gravity?: "auto" | "face" | "center";
  quality?: "auto" | number;
}

export function cloudinaryImageUrl(
  publicId: string,
  { width, height, crop = "limit", gravity = "auto", quality = "auto" }: CloudinaryImageOptions = {}
): string {
  if (!CLOUD_NAME) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set.");
  }

  const transforms = ["f_auto", `q_${quality}`];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);
  if (crop === "fill" || crop === "thumb") transforms.push(`g_${gravity}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}

/** Generates a `srcset` string across common breakpoints for responsive <img>. */
export function cloudinarySrcSet(publicId: string, widths: number[] = [400, 800, 1200, 1600, 2000]): string {
  return widths
    .map((w) => `${cloudinaryImageUrl(publicId, { width: w })} ${w}w`)
    .join(", ");
}

export function cloudinaryVideoUrl(publicId: string): string {
  if (!CLOUD_NAME) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set.");
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${publicId}`;
}

export function cloudinaryVideoThumbUrl(publicId: string, width = 800): string {
  if (!CLOUD_NAME) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set.");
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto,w_${width},c_limit/${publicId}.jpg`;
}
