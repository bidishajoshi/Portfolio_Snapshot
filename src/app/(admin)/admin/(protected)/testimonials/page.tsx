import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewsManager } from "@/components/admin/reviews-manager";
import type { Testimonial } from "@/types/database";

export const metadata = { title: "Client Reviews & Testimonials" };
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  const testimonials = (data ?? []) as unknown as Testimonial[];

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
