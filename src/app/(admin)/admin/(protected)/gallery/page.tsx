import { createAdminClient } from "@/lib/supabase/admin";
import { GalleryManager } from "@/components/admin/gallery/gallery-manager";
import type { EditableRecord } from "@/components/admin/content-editor";
import { categories as fallbackCategories } from "@/data/categories";
import { photos as fallbackPhotos } from "@/data/photos";

export const metadata = { title: "Gallery" };
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let records: EditableRecord[] = [];
  let categoryOptions: Array<{ id: string; name: string }> = [];

  try {
    const supabase = createAdminClient();
    const [{ data: photos }, { data: categories }] = await Promise.all([
      supabase.from("photos").select("id, title, caption, location, photo_date, media_id, category_id, alt_text, status, featured").order("display_order"),
      supabase.from("categories").select("id, name").order("display_order"),
    ]);

    if (photos && photos.length > 0) {
      records = photos.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.caption,
        location: item.location,
        date: item.photo_date,
        mediaId: item.media_id,
        categoryId: item.category_id,
        altText: item.alt_text,
        published: item.status === "published",
        featured: item.featured ?? false,
      }));
    }

    if (categories && categories.length > 0) {
      categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));
    }
  } catch (error) {
    console.warn("Could not load gallery from database, using fallback data:", error);
  }

  if (categoryOptions.length === 0) {
    categoryOptions = fallbackCategories.map((c) => ({ id: String(c.id), name: c.name }));
  }

  if (records.length === 0) {
    records = fallbackPhotos.map((p) => ({
      id: String(p.id),
      title: p.title,
      description: p.location || "",
      location: p.location,
      date: p.date,
      mediaId: null,
      categoryId: null,
      altText: p.title,
      published: true,
      featured: true,
    }));
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Gallery</h1>
        <p className="text-stone text-sm mt-1">Manage every photograph shown in the homepage portfolio gallery.</p>
      </div>
      <GalleryManager
        records={records}
        categories={categoryOptions}
      />
    </div>
  );
}
