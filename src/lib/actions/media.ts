"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { renameMediaSchema, mediaSearchSchema } from "@/lib/validation/media";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { getCloudinary } from "@/lib/cloudinary/config";
import type { Media, MediaFolder, MediaKind } from "@/types/database";

export interface MediaSearchParams {
  query?: string;
  folder?: MediaFolder;
  kind?: MediaKind;
  includeArchived?: boolean;
  page?: number;
  pageSize?: number;
}

export async function searchMedia(params: MediaSearchParams) {
  await requireAdmin();
  const parsed = mediaSearchSchema.parse(params);
  const supabase = createAdminClient();

  let query = supabase
    .from("media")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (!parsed.includeArchived) query = query.eq("archived", false);
  if (parsed.folder) query = query.eq("folder", parsed.folder);
  if (parsed.kind) query = query.eq("kind", parsed.kind);
  if (parsed.query) query = query.ilike("title", `%${parsed.query}%`);

  const from = (parsed.page - 1) * parsed.pageSize;
  const to = from + parsed.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { items: (data ?? []) as Media[], total: count ?? 0 };
}

export async function renameMedia(input: {
  id: string;
  title: string;
  altText?: string;
  tags?: string[];
}) {
  await requireAdmin();
  const parsed = renameMediaSchema.parse(input);
  const supabase = createAdminClient();

  const slug = await generateUniqueSlug(supabase, "media", parsed.title, parsed.id);

  const { data, error } = await supabase
    .from("media")
    .update({
      title: parsed.title,
      slug,
      alt_text: parsed.altText ?? null,
      tags: parsed.tags ?? [],
    })
    .eq("id", parsed.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/media");
  return data as Media;
}

/**
 * Every place a media item might be in use, checked before archive/delete
 * so publishing content never silently breaks (spec section 60).
 */
export async function getMediaReferences(mediaId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const [photos, heroSlides, albumsCover, categoriesCover, servicesUsing, filmsCover, filmsVideo, filmMedia, storiesCover, storyMedia, testimonialsUsing, aboutProfile, aboutEquipment, aboutAwards, siteSettingsLogo] =
    await Promise.all([
      supabase.from("photos").select("id, title").eq("media_id", mediaId),
      supabase.from("hero_slides").select("id, heading").eq("media_id", mediaId),
      supabase.from("albums").select("id, title").eq("cover_media_id", mediaId),
      supabase.from("categories").select("id, name").eq("cover_media_id", mediaId),
      supabase.from("services").select("id, title").eq("media_id", mediaId),
      supabase.from("films").select("id, title").eq("cover_media_id", mediaId),
      supabase.from("films").select("id, title").eq("video_media_id", mediaId),
      supabase.from("film_media").select("id, film_id").eq("media_id", mediaId),
      supabase.from("stories").select("id, title").eq("cover_media_id", mediaId),
      supabase.from("story_media").select("story_id").eq("media_id", mediaId),
      supabase.from("testimonials").select("id, client_name").eq("client_media_id", mediaId),
      supabase.from("about_content").select("id").eq("profile_media_id", mediaId),
      supabase.from("about_equipment").select("id, name").eq("media_id", mediaId),
      supabase.from("about_awards").select("id, title").eq("media_id", mediaId),
      supabase.from("site_settings").select("id").or(
        `logo_media_id.eq.${mediaId},favicon_media_id.eq.${mediaId},default_og_media_id.eq.${mediaId}`
      ),
    ]);

  const references = [
    ...(photos.data ?? []).map((r) => ({ type: "Photo", label: r.title })),
    ...(heroSlides.data ?? []).map((r) => ({ type: "Hero slide", label: r.heading ?? "Untitled slide" })),
    ...(albumsCover.data ?? []).map((r) => ({ type: "Album cover", label: r.title })),
    ...(categoriesCover.data ?? []).map((r) => ({ type: "Category cover", label: r.name })),
    ...(servicesUsing.data ?? []).map((r) => ({ type: "Service", label: r.title })),
    ...(filmsCover.data ?? []).map((r) => ({ type: "Film cover", label: r.title })),
    ...(filmsVideo.data ?? []).map((r) => ({ type: "Film video", label: r.title })),
    ...(filmMedia.data ?? []).map(() => ({ type: "Film gallery", label: "Film gallery item" })),
    ...(storiesCover.data ?? []).map((r) => ({ type: "Story cover", label: r.title })),
    ...(storyMedia.data ?? []).map(() => ({ type: "Story media", label: "Story media item" })),
    ...(testimonialsUsing.data ?? []).map((r) => ({ type: "Testimonial", label: r.client_name })),
    ...(aboutProfile.data ?? []).map(() => ({ type: "About page", label: "Profile photo" })),
    ...(aboutEquipment.data ?? []).map((r) => ({ type: "Equipment", label: r.name })),
    ...(aboutAwards.data ?? []).map((r) => ({ type: "Award", label: r.title })),
    ...(siteSettingsLogo.data ?? []).map(() => ({ type: "Site settings", label: "Logo / favicon / OG image" })),
  ];

  return references;
}

export async function archiveMedia(mediaId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("media").update({ archived: true }).eq("id", mediaId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/media");
}

export async function restoreMedia(mediaId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("media").update({ archived: false }).eq("id", mediaId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/media");
}

/**
 * Permanently deletes a media asset from both Supabase and Cloudinary.
 * Refuses if anything still references it — the caller should show the
 * admin those references (via getMediaReferences) and offer "archive
 * instead" rather than force through a broken public page.
 */
export async function deleteMedia(mediaId: string) {
  await requireAdmin();

  const references = await getMediaReferences(mediaId);
  if (references.length > 0) {
    throw new Error(
      `This photo is used in ${references.length} place(s). Remove those uses first, or archive it instead of deleting.`
    );
  }

  const supabase = createAdminClient();
  const { data: media, error: fetchError } = await supabase
    .from("media")
    .select("cloudinary_public_id, kind")
    .eq("id", mediaId)
    .single();

  if (fetchError || !media) throw new Error("Photo not found.");

  const cloudinary = getCloudinary();
  await cloudinary.uploader.destroy(media.cloudinary_public_id, {
    resource_type: media.kind === "video" ? "video" : "image",
  });

  const { error: deleteError } = await supabase.from("media").delete().eq("id", mediaId);
  if (deleteError) throw new Error(deleteError.message);

  revalidatePath("/admin/media");
}
