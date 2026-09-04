import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StoryDetailClient from "./StoryDetailClient";
import { cloudinaryImageUrl, cloudinaryVideoUrl } from "@/lib/cloudinary/url";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: story } = await supabase
    .from("stories")
    .select("id, title, slug, introduction, location, story_date, cover_media_id, subtitle, tags")
    .eq("slug", slug)
    .maybeSingle();

  if (!story) {
    return (
      <main className="min-h-screen bg-ink p-10 text-ivory flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-3xl">Visual Story not found</h1>
        <Link href="/#stories" className="text-cyan-glow hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to stories
        </Link>
      </main>
    );
  }

  let storyImage = "";
  if (story.cover_media_id) {
    const { data: media } = await supabase
      .from("media")
      .select("cloudinary_public_id")
      .eq("id", story.cover_media_id)
      .maybeSingle();

    if (media?.cloudinary_public_id) {
      storyImage = cloudinaryImageUrl(media.cloudinary_public_id, {
        width: 1600,
        height: 1000,
        crop: "fill",
      });
    }
  }

  const { data: storyMediaList } = await supabase
    .from("story_media")
    .select("id, media:media(id, title, cloudinary_public_id, kind)")
    .eq("story_id", story.id)
    .order("display_order");

  const galleryItems = (storyMediaList ?? [])
    .map((entry) => {
      const m = (entry as unknown as { media: { id: string; title: string; cloudinary_public_id: string; kind: string } | null }).media;
      if (!m) return null;
      return {
        id: m.id,
        title: m.title || story.title,
        cloudinary_public_id: m.cloudinary_public_id,
        kind: m.kind,
        url: cloudinaryImageUrl(m.cloudinary_public_id, { width: 1400, height: 950, crop: "fill" }),
        videoUrl: m.kind === "video" ? cloudinaryVideoUrl(m.cloudinary_public_id) : undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const category = story.subtitle || (story.tags && story.tags.length > 0 ? story.tags[0] : null);

  return (
    <StoryDetailClient
      story={{
        id: story.id,
        title: story.title,
        introduction: story.introduction,
        location: story.location,
        story_date: story.story_date,
        category,
        coverImage: storyImage || undefined,
      }}
      galleryItems={galleryItems}
    />
  );
}