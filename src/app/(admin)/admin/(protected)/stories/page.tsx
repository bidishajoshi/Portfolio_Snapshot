import { createAdminClient } from "@/lib/supabase/admin";
import { ContentMediaManager, type ContentMediaRecord } from "@/components/admin/content-media-manager";
import { ContentEditor, type EditableRecord } from "@/components/admin/content-editor";

export const metadata = { title: "Stories" };
export const dynamic = "force-dynamic";

export default async function AdminStoriesPage() {
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
  const stories = storiesData ?? [];
  const categories = categoriesData ?? [];
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const categoryById = new Map(categories.map((c) => [c.id, c.name]));

  const records: ContentMediaRecord[] = stories.filter((story) => story.id && story.id.length > 10).map((story) => ({ id: story.id, title: story.title }));
  const editableRecords: EditableRecord[] = stories.filter((story) => story.id && story.id.length > 10).map((story) => {
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
      published: story.published ?? false,
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
