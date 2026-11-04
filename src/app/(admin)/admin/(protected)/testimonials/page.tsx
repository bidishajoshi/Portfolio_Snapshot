import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewsManager } from "@/components/admin/reviews-manager";
import type { Testimonial } from "@/types/database";
import { testimonials as fallbackTestimonials } from "@/data/testimonials";

export const metadata = { title: "Client Reviews & Testimonials" };
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  let testimonials: Testimonial[] = [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      testimonials = data as unknown as Testimonial[];
    }
  } catch (error) {
    console.warn("Could not load testimonials from database, using fallback:", error);
  }

  if (testimonials.length === 0) {
    testimonials = fallbackTestimonials.map((t) => ({
      id: String(t.id),
      client_name: t.name,
      review: t.review,
      rating: 5,
      event_type: t.eventType,
      published: true,
      created_at: new Date().toISOString(),
    })) as unknown as Testimonial[];
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Client Reviews & Testimonials</h1>
        <p className="text-stone text-sm mt-1">
          Review, approve, publish, or delete client feedback submitted from the website.
        </p>
      </div>
      <ReviewsManager initialTestimonials={testimonials} />
    </div>
  );
}
