import { createAdminClient } from "@/lib/supabase/admin";
import { AlbumManager } from "@/components/admin/album-manager";
import { albums as fallbackAlbums } from "@/data/albums";

export const metadata = { title: "Albums" };
export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  let albumsList: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    event_date: string | null;
    cover_media_id: string | null;
    published: boolean;
    featured: boolean;
  }> = [];
  const albumMediaMap: Record<string, string[]> = {};

  try {
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

    if (albums && albums.length > 0) {
      albumsList = albums as typeof albumsList;
    }

    for (const row of albumMedia ?? []) {
      if (!albumMediaMap[row.album_id]) {
        albumMediaMap[row.album_id] = [];
      }
      albumMediaMap[row.album_id].push(row.media_id);
    }
  } catch (error) {
    console.warn("Could not load albums from database, using fallback data:", error);
  }

  if (albumsList.length === 0) {
    albumsList = fallbackAlbums.map((a) => ({
      id: String(a.id),
      title: a.title,
      description: a.description,
      location: a.location,
      event_date: a.date,
      cover_media_id: null,
      published: true,
      featured: true,
    }));
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
        albums={albumsList}
        albumMediaMap={albumMediaMap}
      />
    </div>
  );
}
