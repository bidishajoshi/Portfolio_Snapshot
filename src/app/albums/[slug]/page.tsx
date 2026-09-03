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
  const { data: links } = await supabase.from("album_media").select("media:media(title, cloudinary_public_id, kind)").eq("album_id", album.id).order("display_order");
  const media = (links ?? []).map((link) => (link as unknown as { media: { title: string; cloudinary_public_id: string; kind: string } }).media).filter(Boolean);
  return <main className="min-h-screen bg-ink p-8 md:p-16"><Link href="/#albums" className="text-gold">Back to albums</Link><h1 className="mt-8 font-display text-5xl text-ivory">{album.title}</h1><p className="mt-4 max-w-2xl text-stone">{album.description}</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{media.map((item) => item.kind === "video" ? <video key={item.cloudinary_public_id} controls className="aspect-[4/3] w-full rounded-sm object-cover" src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${item.cloudinary_public_id}.mp4`} /> : <SafeImage key={item.cloudinary_public_id} src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${item.cloudinary_public_id}.jpg`} alt={item.title} className="aspect-[4/3] w-full rounded-sm object-cover" />)}</div></main>;
}