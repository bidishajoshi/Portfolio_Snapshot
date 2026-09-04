import { createAdminClient } from "@/lib/supabase/admin";
import { AlbumManager } from "@/components/admin/album-manager";

export const metadata = { title: "Albums" };
export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  const supabase = createAdminClient();
  const [{ data: albums }, { data: albumMedia }] = await Promise.all([
    supabase
      .from("albums")
      .select("id, title, description, location, event_date, cover_media_id, published, featured")
      .order("display_order"),
    supabase
      .from("album_media")
      .select("album_id, media_id")
      .order("display_order"),
  ]);

  const albumMediaMap: Record<string, string[]> = {};
  for (const row of albumMedia ?? []) {
    if (!albumMediaMap[row.album_id]) {
      albumMediaMap[row.album_id] = [];
    }
    albumMediaMap[row.album_id].push(row.media_id);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Albums</h1>
        <p className="text-stone text-sm mt-1">
          Create collections, edit details, and attach unlimited photos and media.
        </p>
      </div>
      <AlbumManager
        albums={(albums ?? []) as Array<{
          id: string;
          title: string;
          description: string | null;
          location: string | null;
          event_date: string | null;
          cover_media_id: string | null;
          published: boolean;
          featured: boolean;
        }>}
        albumMediaMap={albumMediaMap}
      />
    </div>
  );
}

