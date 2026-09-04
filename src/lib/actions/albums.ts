"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueSlug } from "@/lib/utils/slug";

export async function saveAlbum(input: { id?: string; title: string; description?: string; location?: string; eventDate?: string; coverMediaId?: string | null; published?: boolean; featured?: boolean }) {
  await requireAdmin();
  const supabase = createAdminClient();
  const slug = await generateUniqueSlug(supabase, "albums", input.title, input.id);
  const values = { title: input.title, slug, description: input.description || null, location: input.location || null, event_date: input.eventDate || null, cover_media_id: input.coverMediaId ?? null, published: input.published ?? true, featured: input.featured ?? true };
  const query = input.id ? supabase.from("albums").update(values).eq("id", input.id).select().single() : supabase.from("albums").insert(values).select().single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/admin/albums");
  revalidatePath("/");
  if (data?.slug) revalidatePath(`/albums/${data.slug}`);
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
  const { error: deleteError } = await supabase.from("album_media").delete().eq("album_id", albumId);
  if (deleteError) throw new Error(deleteError.message);
  if (mediaIds.length > 0) {
    const rows = mediaIds.map((mediaId, index) => ({ album_id: albumId, media_id: mediaId, display_order: index }));
    const { error } = await supabase.from("album_media").insert(rows);
    if (error) throw new Error(error.message);
  }
  const { data: album } = await supabase.from("albums").select("slug").eq("id", albumId).maybeSingle();
  revalidatePath(`/albums/${albumId}`);
  if (album?.slug) revalidatePath(`/albums/${album.slug}`);
  revalidatePath("/");
}