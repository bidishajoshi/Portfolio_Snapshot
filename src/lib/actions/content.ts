"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueSlug } from "@/lib/utils/slug";

export type EditableContent = "service" | "film" | "story" | "testimonial" | "photo";

const contentTables: Record<EditableContent, string> = {
  service: "services",
  film: "films",
  story: "stories",
  testimonial: "testimonials",
  photo: "photos",
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
  mediaId?: string | null;
  categoryId?: string;
  altText?: string;
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
  const common = {
    ...(slug ? { slug } : {}),
    ...(input.content === "service" ? {} : { published: true, display_order: 0 }),
  };
  let values: Record<string, unknown>;

  if (input.content === "photo") {
    values = { title: input.title, slug, media_id: input.mediaId ?? null, category_id: input.categoryId || null, location: input.location || null, shot_date: input.date || null, alt_text: input.altText || null, status: "published" };
  } else if (input.content === "service") {
    values = { ...common, title: input.title, description: input.description || null, media_id: input.mediaId ?? null };
  } else if (input.content === "testimonial") {
    values = { client_name: input.clientName || input.title, review: input.review || input.description || "", client_media_id: input.mediaId ?? null, published: true, display_order: 0 };
  } else if (input.content === "film") {
    values = { ...common, title: input.title, description: input.description || null, introduction: input.introduction || null, cover_media_id: input.mediaId ?? null, location: input.location || null, film_date: input.date || null };
  } else {
    values = {
      ...(slug ? { slug } : {}),
      title: input.title,
      introduction: input.introduction || input.description || null,
      location: input.location || null,
      story_date: input.date || null,
    };
  }

  const query = input.id
    ? supabase.from(table).update(values).eq("id", input.id).select().single()
    : supabase.from(table).insert(values).select().single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/${table}`);
  revalidatePath("/");
  return data;
}

export async function deleteContent(content: EditableContent, id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from(contentTables[content]).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/${contentTables[content]}`);
  revalidatePath("/");
}
