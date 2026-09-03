import { createClient } from "@/lib/supabase/server";
import { ContentEditor, type EditableRecord } from "@/components/admin/content-editor";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("id, client_name, review, client_media_id").order("display_order");
  const records: EditableRecord[] = (data ?? []).map((item) => ({ id: item.id, title: item.client_name, clientName: item.client_name, review: item.review, mediaId: item.client_media_id }));
  return <div className="flex flex-col gap-8"><div><h1 className="font-display text-3xl text-ivory">Testimonials</h1><p className="text-stone text-sm mt-1">Edit client reviews and attach client photos.</p></div><ContentEditor content="testimonial" records={records} /></div>;
}
