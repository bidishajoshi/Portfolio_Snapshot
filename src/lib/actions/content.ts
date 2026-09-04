"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueSlug } from "@/lib/utils/slug";

export type EditableContent = "service" | "film" | "story" | "testimonial" | "photo" | "album" | "category";

const contentTables: Record<EditableContent, string> = {
  service: "services",
  film: "films",
  story: "stories",
  testimonial: "testimonials",
  photo: "photos",
  album: "albums",
  category: "categories"
};

export async function saveContent(input: {
  content: EditableContent;
  id?: string;
  title: string;
  description?: string;
  introduction?: string;
  location?: string;
  date?: string;
  clientName?: string;
  review?: string;
  eventType?: string;
  mediaId?: string | null;
  categoryId?: string;
  altText?: string;
  published?: boolean;
  featured?: boolean;
}) {
  if (input.date && !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }
  await requireAdmin();
  const supabase = createAdminClient();
  const table = contentTables[input.content];
  const slugBase = input.title || input.clientName || "Untitled";
  const slug = input.content === "testimonial"
    ? undefined
    : await generateUniqueSlug(supabase, table, slugBase, input.id);
  const published = input.published ?? true;
  const featured = input.featured ?? false;
  let values: Record<string, unknown>;

  if (input.content === "photo") {
    if (!input.id && !input.mediaId) {
      throw new Error("Please select or upload a photo for the gallery.");
    }
    values = {
      title: input.title,
      slug,
      caption: input.description || null,
      media_id: input.mediaId ?? null,
      category_id: input.categoryId || null,
      location: input.location || null,
      photo_date: input.date || null,
      alt_text: input.altText || null,
      status: published ? "published" : "draft",
      featured,
      is_featured: featured,
      is_visible: true,
      display_order: 0,
    };
  } else if (input.content === "service") {
    values = {
      title: input.title,
      slug,
      description: input.description || null,
      media_id: input.mediaId ?? null,
      published,
      featured,
      is_visible: true,
      display_order: 0,
    };
  } else if (input.content === "testimonial") {
    values = {
      client_name: input.clientName || input.title,
      review: input.review || input.description || "",
      event_type: input.eventType || null,
      client_media_id: input.mediaId ?? null,
      published,
      is_published: published,
      featured,
      display_order: 0,
    };
  } else if (input.content === "film") {
    values = {
      title: input.title,
      slug,
      description: input.description || null,
      introduction: input.introduction || null,
      cover_media_id: input.mediaId ?? null,
      location: input.location || null,
      film_date: input.date || null,
      published,
      featured,
      is_featured: featured,
      display_order: 0,
    };
  } else if (input.content === "album") {
    values = {
      title: input.title,
      slug,
      description: input.description || null,
      location: input.location || null,
      event_date: input.date || null,
      cover_media_id: input.mediaId ?? null,
      published,
      is_published: published,
      featured,
      is_featured: featured,
      is_visible: true,
      display_order: 0,
    };
  } else if (input.content === "category") {
    values = {
      name: input.title,
      slug,
      description: input.description || null,
      cover_media_id: input.mediaId ?? null,
      published,
      featured,
      is_visible: true,
      display_order: 0,
    };
  } else {
    let storyCatName: string | null = null;
    if (input.categoryId) {
      const { data: cat } = await supabase.from("categories").select("name").eq("id", input.categoryId).maybeSingle();
      if (cat?.name) storyCatName = cat.name;
    }
    values = {
      ...(slug ? { slug } : {}),
      title: input.title,
      introduction: input.introduction || input.description || null,
      location: input.location || null,
      story_date: input.date || null,
      cover_media_id: input.mediaId ?? null,
      tags: storyCatName ? [storyCatName, input.categoryId!] : input.categoryId ? [input.categoryId] : null,
      subtitle: storyCatName || null,
      published,
      is_published: published,
      featured,
      is_featured: featured,
      display_order: 0,
    };
  }

  const query = input.id
    ? supabase.from(table).update(values).eq("id", input.id).select().single()
    : supabase.from(table).insert(values).select().single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const adminPath = input.content === "photo" ? "/admin/gallery" : `/admin/${table}`;
  revalidatePath(adminPath);
  revalidatePath("/");
  if (slug) {
    if (input.content === "album") revalidatePath(`/albums/${slug}`);
    if (input.content === "story") revalidatePath(`/stories/${slug}`);
  }
  return data;
}

export async function deleteContent(content: EditableContent, id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from(contentTables[content]).delete().eq("id", id);
  if (error) throw new Error(error.message);
  const adminPath = content === "photo" ? "/admin/gallery" : `/admin/${contentTables[content]}`;
  revalidatePath(adminPath);
  revalidatePath("/");
}
