"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveSocialLink(input: { id?: string; platform: string; label?: string; url: string; enabled?: boolean }) {
  await requireAdmin();
  const supabase = createAdminClient();
  const values = { platform: input.platform, label: input.label || null, url: input.url };
  const query = input.id ? supabase.from("social_links").update(values).eq("id", input.id) : supabase.from("social_links").insert(values);
  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
  revalidatePath("/");
}

export async function deleteSocialLink(id: string) {
  await requireAdmin();
  const { error } = await createAdminClient().from("social_links").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
  revalidatePath("/");
}

export async function submitInquiry(input: { name: string; email: string; phone?: string; eventType?: string; eventDate?: string; message: string }) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("inquiries").insert({ name: input.name, email: input.email, phone: input.phone || null, event_type: input.eventType || null, event_date: input.eventDate || null, message: input.message });
  if (error) throw new Error(error.message);
}
