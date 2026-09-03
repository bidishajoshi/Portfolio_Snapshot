"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function assignContentMedia(input: {
  content: "service" | "film" | "story";
  contentId: string;
  mediaId: string | null;
  field: "cover" | "video" | "gallery";
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  if (input.field === "gallery") {
    const table = input.content === "film" ? "film_media" : "story_media";
    const key = input.content === "film" ? "film_id" : "story_id";
    if (!input.mediaId) throw new Error("Choose media first.");
    const { error } = await supabase.from(table).upsert({
      [key]: input.contentId,
      media_id: input.mediaId,
      display_order: 0,
    });
    if (error) throw new Error(error.message);
  } else {
    const table = `${input.content}s`;
    const column = input.content === "film" && input.field === "video"
      ? "video_media_id"
      : input.content === "film" || input.content === "story"
        ? "cover_media_id"
        : "media_id";
    const { error } = await supabase.from(table).update({ [column]: input.mediaId }).eq("id", input.contentId);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/${input.content === "service" ? "services" : `${input.content}s`}`);
}
