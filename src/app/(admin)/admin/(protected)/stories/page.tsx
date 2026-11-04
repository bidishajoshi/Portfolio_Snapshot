import { createAdminClient } from "@/lib/supabase/admin";
import { ContentMediaManager, type ContentMediaRecord } from "@/components/admin/content-media-manager";
import { ContentEditor, type EditableRecord } from "@/components/admin/content-editor";
import { stories as fallbackStories } from "@/data/stories";

export const metadata = { title: "Stories" };
export const dynamic = "force-dynamic";

export default async function AdminStoriesPage() {
  let stories: Array<{
    id: string;
    title: string;
    slug: string;
    introduction: string | null;
    location: string | null;
    story_date: string | null;
    cover_media_id: string | null;
    published?: boolean | null;
    subtitle?: string | null;
    tags?: string[] | null;
  }> = [];

  let categories: Array<{ id: string; name: string }> = [];

  try {
    const supabase = createAdminClient();
    const [{ data: storiesData }, { data: categoriesData }] = await Promise.all([
      supabase
        .from("stories")
        .select("id, title, slug, introduction, location, story_date, cover_media_id, published, subtitle, tags")
        .order("display_order"),
      supabase
        .from("categories")
        .select("id, name")
        .order("display_order"),
    ]);

    if (storiesData && storiesData.length > 0) stories = storiesData;
    if (categoriesData && categoriesData.length > 0) categories = categoriesData;
  } catch (error) {
    console.warn("Could not load stories from database, using fallback:", error);
  }

  if (stories.length === 0) {
    stories = fallbackStories.map((s) => ({
      id: String(s.id),
      title: s.title,
      slug: s.slug,
      introduction: s.excerpt,
      location: s.location,
      story_date: s.date,
      cover_media_id: null,
      published: true,
      subtitle: "Visual Story",
    }));
  }

  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const categoryById = new Map(categories.map((c) => [c.id, c.name]));

  const records: ContentMediaRecord[] = stories
    .filter((story) => story.id && story.id.length > 0)
    .map((story) => ({ id: story.id, title: story.title }));

  const editableRecords: EditableRecord[] = stories
    .filter((story) => story.id && story.id.length > 0)
    .map((story) => {
      let matchedCatId = "";
      if (story.tags && Array.isArray(story.tags)) {
        for (const t of story.tags) {
          if (categoryById.has(t)) {
            matchedCatId = t;
            break;
          }
          if (categoryByName.has(t.toLowerCase())) {
            matchedCatId = categoryByName.get(t.toLowerCase())!;
            break;
          }
        }
      }
      if (!matchedCatId && story.subtitle && categoryByName.has(story.subtitle.toLowerCase())) {
        matchedCatId = categoryByName.get(story.subtitle.toLowerCase())!;
      }

      return {
        id: story.id,
        title: story.title,
        introduction: story.introduction,
        location: story.location,
        date: story.story_date,
        mediaId: story.cover_media_id,
        categoryId: matchedCatId || undefined,
        published: story.published ?? true,
      };
    });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Visual Stories</h1>
        <p className="text-stone text-sm mt-1">Manage the visual stories and assignments shown on the site.</p>
      </div>

      <ContentEditor content="story" records={editableRecords} categories={categories} />
      <ContentMediaManager content="story" records={records} />
    </div>
  );
}
