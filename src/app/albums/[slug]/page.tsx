import { createAdminClient } from "@/lib/supabase/admin";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { cloudinaryImageUrl, cloudinaryVideoUrl } from "@/lib/cloudinary/url";

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

  return (
    <main className="min-h-screen bg-ink px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/#albums"
          className="inline-flex items-center gap-2 text-sm text-cyan-glow hover:text-ivory transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={16} /> Back to all albums
        </Link>

        <div className="max-w-3xl mb-12">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-cyan-glow mb-3">
            {album.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {album.location}
              </span>
            )}
            {album.event_date && (
              <span className="flex items-center gap-1">
                <Calendar size={13} /> {album.event_date}
              </span>
            )}
            <span>{mediaItems.length} {mediaItems.length === 1 ? "photo" : "photos"}</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl text-ivory mb-4 leading-tight">
            {album.title}
          </h1>

          {album.description && (
            <p className="text-stone text-base md:text-lg leading-relaxed">
              {album.description}
            </p>
          )}
        </div>

        {mediaItems.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-sm">
            <p className="text-stone text-sm">No photos have been added to this album yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mediaItems.map((item) => (
              <div
                key={item.cloudinary_public_id}
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface border border-border/40 shadow-lg"
              >
                {item.kind === "video" ? (
                  <video
                    controls
                    className="h-full w-full object-cover"
                    src={cloudinaryVideoUrl(item.cloudinary_public_id)}
                  />
                ) : (
                  <SafeImage
                    src={cloudinaryImageUrl(item.cloudinary_public_id, {
                      width: 1200,
                      height: 900,
                      crop: "fill",
                    })}
                    alt={item.title || album.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                {item.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs text-ivory font-medium truncate">{item.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}