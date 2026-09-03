"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { cloudinaryImageUrl } from "@/lib/cloudinary/url";
import type { Category, Media } from "@/types/database";

export function CategoryFormModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [seoTitle, setSeoTitle] = useState(category?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(category?.seo_description ?? "");
  const [cover, setCover] = useState<Media | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    if (!name.trim()) {
      toast.error("Give this category a name.");
      return;
    }
    startTransition(async () => {
      try {
        if (category) {
          await updateCategory({
            id: category.id,
            name,
            description: description || undefined,
            coverMediaId: cover?.id ?? category.cover_media_id,
            published: category.published,
            seoTitle: seoTitle || undefined,
            seoDescription: seoDescription || undefined,
          });
        } else {
          await createCategory({
            name,
            description: description || undefined,
            coverMediaId: cover?.id ?? null,
            published: true,
            seoTitle: seoTitle || undefined,
            seoDescription: seoDescription || undefined,
          });
        }
        toast.success("Category saved.");
        onSaved();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-sm border border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-xl text-ivory">{category ? "Edit category" : "New category"}</p>
          <button onClick={onClose} className="text-stone hover:text-ivory">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-stone">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-ink border border-border rounded-sm px-3.5 py-2.5 text-sm text-ivory outline-none focus:border-gold resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-stone">Cover image</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-sm bg-ink overflow-hidden shrink-0">
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cloudinaryImageUrl(cover.cloudinary_public_id, { width: 100, height: 100, crop: "fill" })}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                {cover ? "Change" : "Choose photo"}
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-stone-dim mb-3">SEO (optional)</p>
            <div className="flex flex-col gap-3">
              <Input label="SEO title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              <Input
                label="SEO description"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={isPending}>
              Save
            </Button>
          </div>
        </div>
      </div>

      {pickerOpen && (
        <MediaPicker
          multiple={false}
          onSelect={(items) => setCover(items[0] ?? null)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
