import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cloudinaryImageUrl, cloudinaryVideoUrl } from "@/lib/cloudinary/url";
import AlbumDetailClient from "./AlbumDetailClient";
import { albums as fallbackAlbums } from "@/data/albums";

export const dynamic = "force-dynamic";

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let album: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    location: string | null;
    event_date: string | null;
    cover_media_id?: string | null;
  } | null = null;

  let formattedItems: Array<{
    id: string;
    title: string;
    cloudinary_public_id: string;
    kind: string;
    url: string;
    videoUrl?: string;
  }> = [];

  try {
    const supabase = createAdminClient();
    const { data: dbAlbum } = await supabase
      .from("albums")
      .select("id, title, slug, description, location, event_date, cover_media_id")
      .eq("slug", slug)
      .maybeSingle();

    if (dbAlbum) {
      album = dbAlbum;
      const { data: links } = await supabase
        .from("album_media")
        .select("media:media(id, title, cloudinary_public_id, secure_url, public_id, kind)")
        .eq("album_id", dbAlbum.id)
        .order("display_order");

      let mediaItems = (links ?? [])
        .map((link) => (link as unknown as { media: { id: string; title: string; cloudinary_public_id: string; secure_url?: string | null; public_id?: string | null; kind: string } | null }).media)
        .filter((item): item is { id: string; title: string; cloudinary_public_id: string; secure_url?: string | null; public_id?: string | null; kind: string } => Boolean(item));

      if (mediaItems.length === 0 && dbAlbum.cover_media_id) {
        const { data: coverMedia } = await supabase
          .from("media")
          .select("id, title, cloudinary_public_id, secure_url, public_id, kind")
          .eq("id", dbAlbum.cover_media_id)
          .maybeSingle();
        if (coverMedia) {
          mediaItems = [coverMedia];
        }
      }

      formattedItems = mediaItems.map((item) => {
        const mId = item.secure_url || item.cloudinary_public_id || item.public_id || "";
        return {
          id: item.id,
          title: item.title,
          cloudinary_public_id: mId,
          kind: item.kind,
          url: cloudinaryImageUrl(mId, {
            width: 1600,
            height: 1200,
            crop: "fill",
          }),
          videoUrl: item.kind === "video" ? cloudinaryVideoUrl(mId) : undefined,
        };
      });
    }
  } catch (error) {
    console.warn("Could not load album from database, checking fallback:", error);
  }

  // Fallback if not found in database
  if (!album) {
    const matchedFallback = fallbackAlbums.find((a) => a.slug === slug || String(a.id) === slug);
    if (matchedFallback) {
      album = {
        id: String(matchedFallback.id),
        title: matchedFallback.title,
        slug: matchedFallback.slug,
        description: matchedFallback.description,
        location: matchedFallback.location,
        event_date: matchedFallback.date,
      };

      formattedItems = (matchedFallback.photos || []).map((p, idx) => ({
        id: String(p.id || idx),
        title: p.title || matchedFallback.title,
        cloudinary_public_id: p.image,
        kind: "image",
        url: p.image,
      }));
    }
  }

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
