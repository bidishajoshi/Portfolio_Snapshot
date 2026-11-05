import { z } from "zod";

export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 50 MB in bytes (52,428,800 bytes)

export const mediaFolderSchema = z.enum([
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
]);

export const ALLOWED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "tiff",
  "tif",
  "avif",
] as const;

export const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "mov", "webm"] as const;

export function isAllowedMediaFile(fileName: string, mimeType?: string): boolean {
  if (mimeType) {
    if (mimeType.startsWith("image/") || mimeType.startsWith("video/")) {
      return true;
    }
  }
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return false;
  return (
    ALLOWED_IMAGE_EXTENSIONS.includes(ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number]) ||
    ALLOWED_VIDEO_EXTENSIONS.includes(ext as (typeof ALLOWED_VIDEO_EXTENSIONS)[number])
  );
}

/**
 * Confirms a completed direct-to-storage upload (Cloudinary or Supabase Storage)
 * and creates the corresponding `media` row.
 */
export const confirmUploadSchema = z.object({
  storageType: z.enum(["supabase", "cloudinary"]).optional().default("cloudinary"),
  storagePath: z.string().max(500).optional().nullable(),
  cloudinaryPublicId: z.string().max(500).optional().nullable(),
  publicId: z.string().max(500).optional().nullable(),
  secureUrl: z.string().optional().nullable(),
  resourceType: z.enum(["image", "video"]).optional().nullable(),
  format: z.string().max(50).optional().nullable(),
  bytes: z.number().nonnegative().optional().nullable(),
  width: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  duration: z.number().nonnegative().optional().nullable(),
  kind: z.enum(["image", "video"]).default("image"),
  folder: mediaFolderSchema.default("photo"),
  title: z
    .string()
    .max(200)
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : "Untitled")),
  altText: z.string().max(300).optional().nullable(),
  tags: z.array(z.string().max(50)).max(30).optional().nullable(),
});

export const renameMediaSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Give this photo a name.").max(200),
  altText: z.string().max(300).optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
});

export const mediaSearchSchema = z.object({
  query: z.string().max(200).optional(),
  folder: mediaFolderSchema.optional(),
  kind: z.enum(["image", "video"]).optional(),
  includeArchived: z.boolean().optional().default(false),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(40),
});
