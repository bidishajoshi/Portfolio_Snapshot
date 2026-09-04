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
        <h1 className="font-display text-3xl text-ivory">Stories</h1>
        <p className="text-stone text-sm mt-1">Manage the visual stories and assignments shown on the site.</p>
      </div>

      {stories.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-sm">
          <p className="text-sm text-stone">No stories yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stories.map((story) => {
            const catName = story.subtitle || (story.tags && story.tags.length > 0 ? story.tags[0] : null);
            return (
              <div key={story.id} className="rounded-sm border border-border bg-surface px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-ivory font-medium">{story.title}</p>
                      {catName && (
                        <span className="rounded-sm bg-cyan-glow/10 text-cyan-glow text-[10px] uppercase font-bold px-1.5 py-0.5 border border-cyan-glow/20">
                          {catName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-dim mt-1">/{story.slug}</p>
                    {story.introduction && <p className="text-sm text-stone mt-3">{story.introduction}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-stone-dim">
                    {story.published ? "Published" : "Draft"}
                  </span>
                </div>
                {(story.location || story.story_date) && (
                  <p className="text-xs text-gold mt-3">
                    {[story.location, story.story_date].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      <ContentMediaManager content="story" records={records} />
      <ContentEditor content="story" records={editableRecords} categories={categories} />
    </div>
  );
}
