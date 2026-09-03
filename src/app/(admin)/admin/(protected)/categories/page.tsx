"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Eye, EyeOff, Pencil } from "lucide-react";
import {
  listCategoriesAdmin,
  updateCategory,
  deleteCategory,
  reorderCategories,
  type CategoryWithCover,
} from "@/lib/actions/categories";
import { DraggableList } from "@/components/admin/draggable-list";
import { CategoryFormModal } from "@/components/admin/categories/category-form-modal";
import { Button } from "@/components/ui/button";
import { cloudinaryImageUrl } from "@/lib/cloudinary/url";
import type { Category } from "@/types/database";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCover[]>([]);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const data = await listCategoriesAdmin();
      setCategories(data);
    });
  };

  useEffect(load, []);

  const togglePublished = (cat: Category) => {
    startTransition(async () => {
      await updateCategory({
        id: cat.id,
        name: cat.name,
        description: cat.description ?? undefined,
        coverMediaId: cat.cover_media_id,
        published: !cat.published,
        seoTitle: cat.seo_title ?? undefined,
        seoDescription: cat.seo_description ?? undefined,
        ogMediaId: cat.og_media_id,
      });
      load();
    });
  };

  const remove = (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteCategory(cat.id);
        toast.success("Category deleted.");
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ivory">Categories</h1>
          <p className="text-stone text-sm mt-1">Drag to reorder how they appear on the site.</p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus size={14} /> New category
        </Button>
      </div>

      {!isPending && categories.length === 0 && (
        <div className="py-16 text-center border border-dashed border-border rounded-sm">
          <p className="text-sm text-stone">No categories yet.</p>
        </div>
      )}

      <DraggableList
        items={categories}
        getId={(c) => c.id}
        onReorder={(ids) => {
          setCategories((prev) => ids.map((id) => prev.find((c) => c.id === id)!));
          reorderCategories(ids);
        }}
        renderItem={(cat, handle) => (
          <div className="flex items-center gap-4 rounded-sm border border-border bg-surface px-4 py-3">
            {handle}
            <div className="h-12 w-12 shrink-0 rounded-sm overflow-hidden bg-ink">
              {cat.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cloudinaryImageUrl(cat.cover.cloudinary_public_id, { width: 100, height: 100, crop: "fill" })}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ivory truncate">{cat.name}</p>
              <p className="text-xs text-stone-dim truncate">/{cat.slug}</p>
            </div>
            <button
              onClick={() => togglePublished(cat)}
              className="text-stone hover:text-ivory"
              title={cat.published ? "Published — click to hide" : "Hidden — click to publish"}
            >
              {cat.published ? <Eye size={16} /> : <EyeOff size={16} className="text-stone-dim" />}
            </button>
            <button onClick={() => setEditing(cat)} className="text-stone hover:text-gold">
              <Pencil size={15} />
            </button>
            <button onClick={() => remove(cat)} className="text-xs text-stone-dim hover:text-danger">
              Delete
            </button>
          </div>
        )}
      />

      {editing && (
        <CategoryFormModal
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
