"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { categoryInputSchema, type CategoryInput } from "@/lib/validation/category";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { Category } from "@/types/database";

export type CategoryWithCover = Category & {
  cover?: { cloudinary_public_id: string } | null;
};

export async function listCategoriesAdmin(): Promise<CategoryWithCover[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");
  if (error) throw new Error(error.message);
  const coverIds = (data ?? []).map((category) => category.cover_media_id).filter(Boolean);
  const { data: media } = coverIds.length
    ? await supabase.from("media").select("id, cloudinary_public_id").in("id", coverIds)
    : { data: [] };
  const mediaById = new Map((media ?? []).map((item) => [item.id, item]));
  return (data ?? []).map((category) => ({ ...category, cover: category.cover_media_id ? mediaById.get(category.cover_media_id) ?? null : null })) as unknown as CategoryWithCover[];
}

export async function createCategory(input: CategoryInput) {
  await requireAdmin();
  const parsed = categoryInputSchema.parse(input);
  const supabase = createAdminClient();

  const slug = await generateUniqueSlug(supabase, "categories", parsed.name);

  const { count } = await supabase.from("categories").select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: parsed.name,
      slug,
      description: parsed.description ?? null,
      cover_media_id: parsed.coverMediaId ?? null,
      published: parsed.published,
      seo_title: parsed.seoTitle ?? null,
      seo_description: parsed.seoDescription ?? null,
      og_media_id: parsed.ogMediaId ?? null,
      display_order: count ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/");
  return data as Category;
}

export async function updateCategory(input: CategoryInput) {
  await requireAdmin();
  const parsed = categoryInputSchema.parse(input);
  if (!parsed.id) throw new Error("Missing category id.");
  const supabase = createAdminClient();

  const slug = await generateUniqueSlug(supabase, "categories", parsed.name, parsed.id);

  const { data, error } = await supabase
    .from("categories")
    .update({
      name: parsed.name,
      slug,
      description: parsed.description ?? null,
      cover_media_id: parsed.coverMediaId ?? null,
      published: parsed.published,
      seo_title: parsed.seoTitle ?? null,
      seo_description: parsed.seoDescription ?? null,
      og_media_id: parsed.ogMediaId ?? null,
    })
    .eq("id", parsed.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return data as Category;
}

export async function reorderCategories(orderedIds: string[]) {
  await requireAdmin();
  const supabase = createAdminClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("categories").update({ display_order: index }).eq("id", id)
    )
  );

  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const [albums, photos, films] = await Promise.all([
    supabase.from("albums").select("id, title").eq("category_id", id),
    supabase.from("photos").select("id, title").eq("category_id", id),
    supabase.from("films").select("id, title").eq("category_id", id),
  ]);

  const usageCount = (albums.data?.length ?? 0) + (photos.data?.length ?? 0) + (films.data?.length ?? 0);
  if (usageCount > 0) {
    throw new Error(
      `This category is used by ${usageCount} item(s). Reassign or remove them first, or hide the category instead of deleting it.`
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
