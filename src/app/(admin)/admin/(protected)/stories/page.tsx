import { createClient } from "@/lib/supabase/server";
import { ContentMediaManager, type ContentMediaRecord } from "@/components/admin/content-media-manager";
import { ContentEditor, type EditableRecord } from "@/components/admin/content-editor";

export const metadata = { title: "Stories" };

export default async function AdminStoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, title, slug, introduction, location, story_date, cover_media_id, published")
    .order("display_order");
  const stories = data ?? [];

  const records: ContentMediaRecord[] = stories.filter((story) => story.id && story.id.length > 10).map((story) => ({ id: story.id, title: story.title }));
  const editableRecords: EditableRecord[] = stories.filter((story) => story.id && story.id.length > 10).map((story) => ({ id: story.id, title: story.title, introduction: story.introduction, location: story.location, date: story.story_date, mediaId: story.cover_media_id }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Stories</h1>
        <p className="text-stone text-sm mt-1">Manage the visual stories shown on the site.</p>
      </div>

      {stories.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-sm">
          <p className="text-sm text-stone">No stories yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stories.map((story) => (
            <div key={story.id} className="rounded-sm border border-border bg-surface px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-ivory">{story.title}</p>
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
          ))}
        </div>
      )}
      <ContentMediaManager content="story" records={records} />
      <ContentEditor content="story" records={editableRecords} />
    </div>
  );
}
