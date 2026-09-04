import { createClient } from "@/lib/supabase/server";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { cloudinaryImageUrl, cloudinaryVideoUrl } from "@/lib/cloudinary/url";

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: album } = await supabase.from("albums").select("id, title, slug, description, location, event_date, cover_media_id").eq("slug", slug).eq("published", true).maybeSingle();
  if (!album) return <main className="min-h-screen bg-ink p-10 text-ivory">Album not found.</main>;
  const { data: links } = await supabase.from("album_media").select("media:media(title, cloudinary_public_id, kind)").eq("album_id", album.id).order("display_order");
  const media = (links ?? []).map((link) => (link as unknown as { media: { title: string; cloudinary_public_id: string; kind: string } }).media).filter(Boolean);
  return <main className="min-h-screen bg-ink p-8 md:p-16"><Link href="/#albums" className="text-gold">Back to albums</Link><h1 className="mt-8 font-display text-5xl text-ivory">{album.title}</h1><p className="mt-4 max-w-2xl text-stone">{album.description}</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{media.map((item) => item.kind === "video" ? <video key={item.cloudinary_public_id} controls className="aspect-[4/3] w-full rounded-sm object-cover" src={cloudinaryVideoUrl(item.cloudinary_public_id)} /> : <SafeImage key={item.cloudinary_public_id} src={cloudinaryImageUrl(item.cloudinary_public_id, { width: 1000, height: 750, crop: "fill" })} alt={item.title} className="aspect-[4/3] w-full rounded-sm object-cover" />)}</div></main>;
}