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
  const { error } = await supabase.from("homepage_sections").update(values).eq("id", id);
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
