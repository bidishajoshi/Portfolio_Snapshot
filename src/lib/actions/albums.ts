"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueSlug } from "@/lib/utils/slug";

export async function saveAlbum(input: { id?: string; title: string; description?: string; location?: string; eventDate?: string; coverMediaId?: string | null; published?: boolean }) {
  await requireAdmin();
  const supabase = createAdminClient();
  const slug = await generateUniqueSlug(supabase, "albums", input.title, input.id);
  const values = { title: input.title, slug, description: input.description || null, location: input.location || null, event_date: input.eventDate || null, cover_media_id: input.coverMediaId ?? null, published: input.published ?? true };
  const query = input.id ? supabase.from("albums").update(values).eq("id", input.id).select().single() : supabase.from("albums").insert(values).select().single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/admin/albums");
  revalidatePath("/");
  return data;
}

export async function deleteAlbum(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/albums");
  revalidatePath("/");
}

export async function setAlbumMedia(albumId: string, mediaIds: string[]) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase.from("album_photos").delete().eq("album_id", albumId);
  if (deleteError) throw new Error(deleteError.message);
  if (mediaIds.length > 0) {
    const { data: photos, error: photoError } = await supabase.from("photos").select("id, media_id").in("media_id", mediaIds);
    if (photoError) throw new Error(photoError.message);
    const photoByMedia = new Map((photos ?? []).map((photo) => [photo.media_id, photo.id]));
    const rows = mediaIds.filter((mediaId) => photoByMedia.has(mediaId)).map((mediaId, index) => ({ album_id: albumId, photo_id: photoByMedia.get(mediaId)!, display_order: index }));
    const { error } = await supabase.from("album_photos").insert(rows);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/albums/${albumId}`);
  revalidatePath("/");
}