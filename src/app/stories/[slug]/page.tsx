import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StoryDetailClient from "./StoryDetailClient";
import { cloudinaryImageUrl, cloudinaryVideoUrl } from "@/lib/cloudinary/url";
import { stories as fallbackStories } from "@/data/stories";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let story: {
    id: string;
    title: string;
    slug: string;
    introduction: string | null;
    location: string | null;
    story_date: string | null;
    cover_media_id?: string | null;
    subtitle?: string | null;
    tags?: string[] | null;
  } | null = null;

  let storyImage = "";
  let galleryItems: Array<{
    id: string;
    title: string;
    cloudinary_public_id: string;
    kind: string;
    url: string;
    videoUrl?: string;
  }> = [];

  try {
    const supabase = createAdminClient();
    const { data: dbStory } = await supabase
      .from("stories")
      .select("id, title, slug, introduction, location, story_date, cover_media_id, subtitle, tags")
      .eq("slug", slug)
      .maybeSingle();

    if (dbStory) {
      story = dbStory;
      if (dbStory.cover_media_id) {
        const { data: media } = await supabase
          .from("media")
          .select("cloudinary_public_id, secure_url, public_id")
          .eq("id", dbStory.cover_media_id)
          .maybeSingle();

        const mediaId = media?.secure_url || media?.cloudinary_public_id || media?.public_id;
        if (mediaId) {
          storyImage = cloudinaryImageUrl(mediaId, {
            width: 1600,
            height: 1000,
            crop: "fill",
          });
        }
      }

      const { data: storyMediaList } = await supabase
        .from("story_media")
        .select("id, media:media(id, title, cloudinary_public_id, secure_url, public_id, kind)")
        .eq("story_id", dbStory.id)
        .order("display_order");

      galleryItems = (storyMediaList ?? [])
        .map((entry) => {
          const m = (entry as unknown as { media: { id: string; title: string; cloudinary_public_id: string; secure_url?: string | null; public_id?: string | null; kind: string } | null }).media;
          if (!m) return null;
          const mId = m.secure_url || m.cloudinary_public_id || m.public_id || "";
          return {
            id: m.id,
            title: m.title || dbStory.title,
            cloudinary_public_id: mId,
            kind: m.kind,
            url: cloudinaryImageUrl(mId, { width: 1400, height: 950, crop: "fill" }),
            videoUrl: m.kind === "video" ? cloudinaryVideoUrl(mId) : undefined,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
    }
  } catch (error) {
    console.warn("Could not load story from database, checking fallback:", error);
  }

  // Fallback if not found in database
  if (!story) {
    const matchedFallback = fallbackStories.find((s) => s.slug === slug || String(s.id) === slug);
    if (matchedFallback) {
      story = {
        id: String(matchedFallback.id),
        title: matchedFallback.title,
        slug: matchedFallback.slug,
        introduction: matchedFallback.excerpt,
        location: matchedFallback.location,
        story_date: matchedFallback.date,
        subtitle: "Visual Story",
      };
      storyImage = matchedFallback.cover;

      galleryItems = (matchedFallback.blocks || [])
        .filter((b) => b.type === "image")
        .map((b, idx) => ({
          id: `story-photo-${idx}`,
          title: b.caption || matchedFallback.title,
          cloudinary_public_id: b.content,
          kind: "image",
          url: b.content,
        }));
    }
  }

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
