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
 * Confirms a completed direct-to-storage upload (Supabase Storage or Cloudinary)
 * and creates the corresponding `media` row.
 */
export const confirmUploadSchema = z.object({
  storageType: z.enum(["supabase", "cloudinary"]).optional().default("supabase"),
  storagePath: z.string().min(1).max(500).optional(),
  cloudinaryPublicId: z.string().min(1).max(500).optional(),
  publicId: z.string().min(1).max(500).optional(),
  secureUrl: z.string().url().optional(),
  resourceType: z.enum(["image", "video"]).optional(),
  format: z.string().max(20).optional(),
  bytes: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().nonnegative().optional(),
  kind: z.enum(["image", "video"]),
  folder: mediaFolderSchema,
  title: z.string().min(1, "Give this photo a name.").max(200),
  altText: z.string().max(300).optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
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