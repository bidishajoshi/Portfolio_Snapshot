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
