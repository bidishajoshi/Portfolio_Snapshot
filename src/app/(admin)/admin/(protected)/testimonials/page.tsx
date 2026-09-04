import { createAdminClient } from "@/lib/supabase/admin";
import { ContentEditor, type EditableRecord } from "@/components/admin/content-editor";

export const metadata = { title: "Testimonials" };
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, client_name, review, event_type, client_media_id, published")
    .order("display_order");
  const records: EditableRecord[] = (data ?? []).map((item) => ({
    id: item.id,
    title: item.client_name,
    clientName: item.client_name,
    review: item.review,
    eventType: item.event_type,
    mediaId: item.client_media_id,
    published: item.published ?? true,
  }));
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Testimonials & Client Stories</h1>
        <p className="text-stone text-sm mt-1">
          Create and edit client testimonials, stories, and portraits shown on the website.
        </p>
      </div>
      <ContentEditor content="testimonial" records={records} />
    </div>
  );
}

