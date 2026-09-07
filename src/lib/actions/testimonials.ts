"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Testimonial } from "@/types/database";

export interface PublicReviewInput {
  name: string;
  email: string;
  rating: number;
  review: string;
  eventType?: string;
  honeypot?: string;
}

export async function submitPublicReview(input: PublicReviewInput) {
  // 1. Anti-spam honeypot check
  if (input.honeypot && input.honeypot.trim() !== "") {
    // Silent return to fool spambots
    return { success: true, message: "Review submitted successfully!" };
  }

  // 2. Input validation
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const review = input.review?.trim();
  const rating = Number(input.rating);
  const eventType = input.eventType?.trim() || null;

  if (!name || name.length < 2) {
    throw new Error("Please enter your full name (at least 2 characters).");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!review || review.length < 10) {
    throw new Error("Please write a review or comment (at least 10 characters).");
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error("Please select a rating between 1 and 5 stars.");
  }

  const supabase = createAdminClient();

  // 3. Simple rate-limiting / duplicate check: check if same email submitted a review in last 60 seconds
  const { data: recent } = await supabase
    .from("testimonials")
    .select("id, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent && recent.created_at) {
    const elapsedMs = Date.now() - new Date(recent.created_at).getTime();
    if (elapsedMs < 60000) {
      throw new Error("You recently submitted a review. Please wait a minute before submitting another.");
    }
  }

  // 4. Insert as unpublished (pending admin moderation)
  const { error } = await supabase.from("testimonials").insert({
    client_name: name,
    email,
    review,
    rating,
    event_type: eventType,
    published: false,
    display_order: 0,
  });

  if (error) {
    console.error("SUBMIT REVIEW ERROR:", error);
    throw new Error(error.message || "Could not submit review. Please try again.");
  }

  revalidatePath("/");
  revalidatePath("/admin/testimonials");

  return {
    success: true,
    message: "Review submitted successfully! Your review is pending admin approval before appearing publicly.",
  };
}

export async function listTestimonialsAdmin(): Promise<Testimonial[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Testimonial[];
}

export async function toggleTestimonialPublished(id: string, published: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("testimonials")
    .update({ published })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function saveTestimonialAdmin(input: {
  id?: string;
  client_name: string;
  email?: string | null;
  review: string;
  rating?: number | null;
  event_type?: string | null;
  published?: boolean;
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  const payload = {
    client_name: input.client_name,
    email: input.email || null,
    review: input.review,
    rating: input.rating ?? 5,
    event_type: input.event_type || null,
    published: input.published ?? true,
  };

  if (input.id) {
    const { error } = await supabase.from("testimonials").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("testimonials").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}
