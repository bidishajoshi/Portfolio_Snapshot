"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listInquiries() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function setInquiryRead(id: string, isRead: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("inquiries").update({ is_read: isRead }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inquiries");
}

export async function setInquiryStatus(id: string, status: "new" | "read" | "replied" | "completed") {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("inquiries").update({ status, is_read: status !== "new" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inquiries");
}

export async function createInquiry(input: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  eventType?: string;
  eventDate?: string;
  message: string;
}) {
  const supabase = createAdminClient();
  const cleanPhone = input.phone?.trim() || null;
  const cleanSubject = input.subject?.trim() || (input.eventType ? `${input.eventType} Photography Inquiry` : "General Photography Inquiry");

  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      name: input.name.trim(),
      email: input.email.trim(),
      phone: cleanPhone,
      subject: cleanSubject,
      event_type: input.eventType || null,
      event_date: input.eventDate || null,
      message: input.message.trim(),
      status: "new",
      is_read: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/inquiries");
  return data;
}