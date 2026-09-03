import { createClient } from "@/lib/supabase/server";
import { albums as localAlbums } from "@/data/albums";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: album } = await supabase.from("albums").select("id, title, slug, description, location, event_date, cover_media_id").eq("slug", slug).maybeSingle();
  if (!album) {
    const fallback = localAlbums.find((item) => item.slug === slug);
    if (!fallback) return <main className="min-h-screen bg-ink p-10 text-ivory">Album not found.</main>;
    return <main className="min-h-screen bg-ink p-8 md:p-16"><Link href="/#albums" className="text-gold">Back to albums</Link><h1 className="mt-8 font-display text-5xl text-ivory">{fallback.title}</h1><p className="mt-4 max-w-2xl text-stone">{fallback.description}</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fallback.photos.map((photo) => <SafeImage key={photo.id} src={photo.image} alt={photo.title} className="aspect-[4/3] w-full rounded-sm object-cover" />)}</div></main>;
  }
  const { data: links } = await supabase.from("album_photos").select("photo:photos(title, media:media(cloudinary_public_id))").eq("album_id", album.id).order("display_order");
  const photos = (links ?? []).map((link) => (link as unknown as { photo: { title: string; media: { cloudinary_public_id: string } } }).photo).filter(Boolean);
  return <main className="min-h-screen bg-ink p-8 md:p-16"><Link href="/#albums" className="text-gold">Back to albums</Link><h1 className="mt-8 font-display text-5xl text-ivory">{album.title}</h1><p className="mt-4 max-w-2xl text-stone">{album.description}</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo) => <SafeImage key={photo.title} src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${photo.media.cloudinary_public_id}.jpg`} alt={photo.title} className="aspect-[4/3] w-full rounded-sm object-cover" />)}</div></main>;
}