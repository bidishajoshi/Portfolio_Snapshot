import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select("id, title, slug, introduction, location, story_date, cover_media_id")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!story) return <main className="min-h-screen bg-ink p-10 text-ivory">Story not found.</main>;

  let storyImage = "";
  if (story?.cover_media_id) {
    const { data: media } = await supabase
      .from("media")
      .select("cloudinary_public_id")
      .eq("id", story.cover_media_id)
      .maybeSingle();

    if (media?.cloudinary_public_id) {
      storyImage = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1400,c_fill/${media.cloudinary_public_id}`;
    }
  }

  const storyGallery = story
    ? await supabase
        .from("story_media")
        .select("media:media(title, cloudinary_public_id, kind)")
        .eq("story_id", story.id)
        .order("display_order")
    : { data: [] as Array<{ media?: { title: string; cloudinary_public_id: string; kind: string } | null }> };

  const galleryItems: Array<{ title: string; cloudinary_public_id: string; kind: string }> =
    (storyGallery.data ?? [])
      .map((entry) => entry.media)
      .filter((media): media is { title: string; cloudinary_public_id: string; kind: string } => Boolean(media));

  return (
    <main className="min-h-screen bg-ink p-8 md:p-16">
      <Link href="/#stories" className="text-gold">Back to stories</Link>
      <article className="mx-auto mt-10 max-w-4xl">
        <p className="text-sm text-gold">{story.location}</p>
        <h1 className="mt-3 font-display text-5xl text-ivory">{story.title}</h1>
        {storyImage && <img src={storyImage} alt={story.title} className="mt-8 h-[360px] w-full rounded-xl object-cover" />}
        <p className="mt-6 text-lg leading-relaxed text-stone">{story.introduction}</p>
        {galleryItems.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((media) => media.kind === "video" ? (
              <video key={media.cloudinary_public_id} controls className="aspect-[4/3] w-full rounded-sm object-cover" src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${media.cloudinary_public_id}.mp4`} />
            ) : (
              <img key={media.cloudinary_public_id} src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1000,c_fill/${media.cloudinary_public_id}`} alt={media.title} className="aspect-[4/3] w-full rounded-sm object-cover" />
            ))}
          </div>
        )}
        <div className="mt-10 space-y-6 text-stone" />
      </article>
    </main>
  );
}