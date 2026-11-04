import { createClient } from "@/lib/supabase/server";
import { ContentMediaManager, type ContentMediaRecord } from "@/components/admin/content-media-manager";

export const metadata = { title: "Films" };

export default async function FilmsPage() {
  let records: ContentMediaRecord[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("films").select("id, title, cover_media_id, video_media_id").order("display_order");
    if (data && data.length > 0) {
      records = await Promise.all(data.map(async (film) => {
        const { count } = await supabase.from("film_media").select("id", { count: "exact", head: true }).eq("film_id", film.id);
        return { id: film.id, title: film.title, coverMediaId: film.cover_media_id, videoMediaId: film.video_media_id, galleryCount: count ?? 0 };
      }));
    }
  } catch (error) {
    console.warn("Could not load films from database:", error);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Films</h1>
        <p className="text-stone text-sm mt-1">Attach cover images, videos, and gallery media to each film.</p>
      </div>
      <ContentMediaManager content="film" records={records} />
    </div>
  );
}
