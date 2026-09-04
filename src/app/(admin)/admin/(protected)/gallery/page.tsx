import { createClient } from "@/lib/supabase/server";
import { ContentEditor, type EditableRecord } from "@/components/admin/content-editor";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("photos").select("id, title, caption, location, shot_date, media_id, category_id, alt_text, status").order("display_order");
  const records: EditableRecord[] = (data ?? []).map((item) => ({ id: item.id, title: item.title, description: item.caption, location: item.location, date: item.shot_date, mediaId: item.media_id, categoryId: item.category_id, altText: item.alt_text, published: item.status === "published" }));
  return <div className="flex flex-col gap-8"><div><h1 className="font-display text-3xl text-ivory">Gallery</h1><p className="text-stone text-sm mt-1">Manage every photograph shown in the homepage gallery.</p></div><ContentEditor content="photo" records={records} /></div>;
}