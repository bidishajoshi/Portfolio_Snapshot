import { createClient } from "@/lib/supabase/server";
import { AlbumManager } from "@/components/admin/album-manager";

export const metadata = { title: "Albums" };

export default async function AlbumsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("albums").select("id, title, description, location, event_date, cover_media_id").order("display_order");
  return <div className="flex flex-col gap-8"><div><h1 className="font-display text-3xl text-ivory">Albums</h1><p className="text-stone text-sm mt-1">Create collections, edit details, and attach unlimited media.</p></div><AlbumManager albums={(data ?? []) as Array<{ id: string; title: string; description: string | null; location: string | null; event_date: string | null; cover_media_id: string | null }>} /></div>;
}
