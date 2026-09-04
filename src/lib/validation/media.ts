import { z } from "zod";

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

/**
 * Confirms a completed Cloudinary upload and creates the corresponding
 * `media` row. `cloudinaryPublicId` is the only thing we truly trust from
 * the client — everything else (width, height, bytes, format) gets
 * re-verified server-side against Cloudinary's own API before insert
 * (see /api/cloudinary/confirm/route.ts and spec section 59).
 */
export const confirmUploadSchema = z.object({
  cloudinaryPublicId: z.string().min(1).max(500),
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