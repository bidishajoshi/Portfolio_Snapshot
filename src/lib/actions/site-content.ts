"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateSiteContent(table: "site_settings" | "about_content", id: boolean | string, values: Record<string, unknown>) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from(table).update(values).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/admin/${table === "site_settings" ? "settings" : "about"}`);
}

export async function updateHomepageSection(id: string, values: Record<string, unknown>) {
  await requireAdmin();
  const supabase = createAdminClient();

  const updatePayload: Record<string, unknown> = {};
  if ("title" in values) updatePayload.title = values.title;
  if ("subtitle" in values) updatePayload.subtitle = values.subtitle;
  if ("enabled" in values) updatePayload.is_enabled = values.enabled;
  if ("is_enabled" in values) updatePayload.is_enabled = values.is_enabled;
  if ("description" in values) {
    const { data: current } = await supabase.from("homepage_sections").select("content").eq("id", id).maybeSingle();
    const prevContent = (current?.content && typeof current.content === "object" ? current.content : {}) as Record<string, unknown>;
    updatePayload.content = { ...prevContent, description: values.description };
  }

  const { error } = await supabase.from("homepage_sections").update(updatePayload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function setHeroBackground(mediaId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("hero_slides")
    .select("id")
    .order("display_order")
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("hero_slides")
      .update({ media_id: mediaId, published: true, enabled: true })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("hero_slides").insert({
      media_id: mediaId,
      published: true,
      enabled: true,
      display_order: 0,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function addHeroSlide(mediaId: string) {
  return addHeroSlidesBulk([mediaId]);
}

export async function addHeroSlidesBulk(mediaIds: string[]) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("hero_slides").select("id");
  const existingCount = existing?.length ?? 0;

  const remainingSlots = 10 - existingCount;
  if (remainingSlots <= 0) {
    throw new Error("Maximum 10 hero photos allowed.");
  }

  const idsToAdd = mediaIds.slice(0, remainingSlots);
  const rows = idsToAdd.map((media_id, index) => ({
    media_id,
    published: true,
    enabled: true,
    display_order: existingCount + index,
  }));

  const { error } = await supabase.from("hero_slides").insert(rows);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function removeHeroSlide(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { count } = await supabase.from("hero_slides").select("id", { count: "exact", head: true });

  if ((count ?? 0) <= 1) {
    throw new Error("Minimum 1 hero photo is required.");
  }

  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function reorderHeroSlides(orderedIds: string[]) {
  await requireAdmin();
  const supabase = createAdminClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("hero_slides").update({ display_order: index }).eq("id", id)
    )
  );

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function updateAboutSection(input: {
  title?: string;
  subtitle?: string;
  bio?: string;
  mediaId?: string | null;
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: section } = await supabase
    .from("homepage_sections")
    .select("id, content")
    .eq("name", "about")
    .maybeSingle();

  const prevContent = (section?.content && typeof section.content === "object" ? section.content : {}) as Record<string, unknown>;
  const updatedContent = {
    ...prevContent,
    bio: input.bio !== undefined ? input.bio : prevContent.bio,
    portrait_media_id: input.mediaId !== undefined ? input.mediaId : prevContent.portrait_media_id,
  };

  if (section?.id) {
    const { error } = await supabase
      .from("homepage_sections")
      .update({
        title: input.title || null,
        subtitle: input.subtitle || null,
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", section.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("homepage_sections")
      .insert({
        name: "about",
        title: input.title || null,
        subtitle: input.subtitle || null,
        content: updatedContent,
        is_enabled: true,
        order_index: 4,
      });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/about");
}
