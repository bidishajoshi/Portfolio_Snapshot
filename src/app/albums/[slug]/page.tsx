import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cloudinaryImageUrl, cloudinaryVideoUrl } from "@/lib/cloudinary/url";
import AlbumDetailClient from "./AlbumDetailClient";

export const dynamic = "force-dynamic";

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: album } = await supabase
    .from("albums")
    .select("id, title, slug, description, location, event_date, cover_media_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!album) {
    return (
      <main className="min-h-screen bg-ink p-10 text-ivory flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-3xl">Album not found</h1>
        <Link href="/#albums" className="text-cyan-glow hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to albums
        </Link>
      </main>
    );
  }

  const { data: links } = await supabase
    .from("album_media")
    .select("media:media(id, title, cloudinary_public_id, kind)")
    .eq("album_id", album.id)
    .order("display_order");

  let mediaItems = (links ?? [])
    .map((link) => (link as unknown as { media: { id: string; title: string; cloudinary_public_id: string; kind: string } | null }).media)
    .filter((item): item is { id: string; title: string; cloudinary_public_id: string; kind: string } => Boolean(item));

  // If album_media is empty, fallback to cover_media if set
  if (mediaItems.length === 0 && album.cover_media_id) {
    const { data: coverMedia } = await supabase
      .from("media")
      .select("id, title, cloudinary_public_id, kind")
      .eq("id", album.cover_media_id)
      .maybeSingle();
    if (coverMedia) {
      mediaItems = [coverMedia];
    }
  }

  const formattedItems = mediaItems.map((item) => ({
    id: item.id,
    title: item.title,
    cloudinary_public_id: item.cloudinary_public_id,
    kind: item.kind,
    url: cloudinaryImageUrl(item.cloudinary_public_id, {
      width: 1600,
      height: 1200,
      crop: "fill",
    }),
    videoUrl: item.kind === "video" ? cloudinaryVideoUrl(item.cloudinary_public_id) : undefined,
  }));

  return (
    <AlbumDetailClient
      album={{
        id: album.id,
        title: album.title,
        description: album.description,
        location: album.location,
        event_date: album.event_date,
      }}
      mediaItems={formattedItems}
    />
  );
}