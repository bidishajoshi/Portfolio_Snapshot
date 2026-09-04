"use client";

import { useState, useTransition } from "react";
import { Plus, Images, X, Trash2, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { MediaUploader } from "@/components/admin/media/media-uploader";
import { ContentEditor, type EditableRecord } from "@/components/admin/content-editor";
import { saveMultiplePhotos } from "@/lib/actions/content";
import type { Media } from "@/types/database";

interface GalleryManagerProps {
  records: EditableRecord[];
  categories: Array<{ id: string; name: string }>;
}

export function GalleryManager({ records, categories }: GalleryManagerProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [showMultiPhotoModal, setShowMultiPhotoModal] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Multi-photo Story Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-cyan-glow/30 bg-surface-raised">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-glow" />
            <h2 className="text-base font-semibold text-ivory">Selected Stories Multi-Photo Creator</h2>
          </div>
          <p className="text-xs text-stone mt-1 max-w-xl">
            Create a multi-photo story inside Selected Stories: select category, add title & details, choose multiple photos at once, and publish directly to the live gallery.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="sm"
            onClick={() => setShowMultiPhotoModal(true)}
            className="bg-gradient-to-r from-cyan-glow to-blue-500 text-ink hover:from-cyan-glow/90 hover:to-blue-400 font-semibold"
          >
            <Images size={15} /> Add Multi-Photo Story
          </Button>
        </div>
      </div>

      {/* Dropzone toggle */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ivory">Direct Media Dropzone</h3>
            <p className="text-xs text-stone mt-0.5">
              Upload raw photos directly into the photography media bucket.
            </p>
          </div>
          <button
            onClick={() => setShowUploader((prev) => !prev)}
            className="text-xs text-cyan-glow hover:underline"
          >
            {showUploader ? "Hide dropzone" : "Show upload dropzone"}
          </button>
        </div>

        {showUploader && (
          <div className="pt-4">
            <MediaUploader
              folder="photo"
              onUploaded={() => {
                window.location.reload();
              }}
            />
          </div>
        )}
      </div>

      {/* Main Content Editor for Selected Stories */}
      <ContentEditor
        content="photo"
        records={records}
        categories={categories}
      />

      {/* Multi-Photo Story Modal */}
      {showMultiPhotoModal && (
        <MultiPhotoStoryModal
          categories={categories}
          onClose={() => setShowMultiPhotoModal(false)}
          onSaved={() => {
            setShowMultiPhotoModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function MultiPhotoStoryModal({
  categories,
  onClose,
  onSaved,
}: {
  categories: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRemoveMedia = (id: string) => {
    setSelectedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a story title.");
      return;
    }
    if (selectedMedia.length === 0) {
      toast.error("Please select at least one photo.");
      return;
    }

    startTransition(async () => {
      try {
        await saveMultiplePhotos({
          title: title.trim(),
          categoryId: categoryId || undefined,
          location: location.trim() || undefined,
          date: date.trim() || undefined,
          description: description.trim() || undefined,
          mediaList: selectedMedia.map((m) => ({
            id: m.id,
            title: m.title,
            altText: m.alt_text || m.title,
          })),
          featured: true,
          published: true,
        });

        toast.success(`Successfully saved ${selectedMedia.length} photos to Selected Stories!`);
        onSaved();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save photos.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <div>
            <h3 className="font-display text-xl text-ivory">New Multi-Photo Story</h3>
            <p className="text-xs text-stone mt-0.5">Attach multiple photos under a single category and story title.</p>
          </div>
          <button onClick={onClose} className="text-stone hover:text-ivory">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Story Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Royal Kathmandu Wedding"
              autoFocus
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-stone font-medium">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="bg-ink border border-border rounded-md px-3.5 py-2.5 text-sm text-ivory outline-none focus:border-cyan-glow"
              >
                <option value="">Select Category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hyatt Regency, Kathmandu"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-stone font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-ink border border-border rounded-md px-3.5 py-2 text-sm text-ivory outline-none focus:border-cyan-glow"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-stone font-medium">Story Caption / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief summary of the story or moment..."
              className="bg-ink border border-border rounded-md px-3.5 py-2 text-sm text-ivory outline-none focus:border-cyan-glow resize-none"
            />
          </div>

          {/* Photos Selection Area */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-ivory font-medium">
                Selected Photos ({selectedMedia.length})
              </label>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPickerOpen(true)}
                className="border-cyan-glow/40 text-cyan-glow hover:bg-cyan-glow/10"
              >
                <Plus size={14} /> Select / Upload Photos
              </Button>
            </div>

            {selectedMedia.length === 0 ? (
              <div
                onClick={() => setPickerOpen(true)}
                className="border-2 border-dashed border-border hover:border-cyan-glow/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-ink/30"
              >
                <Images size={28} className="mx-auto text-stone-dim mb-2" />
                <p className="text-xs text-stone">Click to browse or upload multiple photos for this story</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-3 bg-ink/40 rounded-xl border border-border">
                {selectedMedia.map((m, index) => (
                  <div key={m.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/c_fill,w_180,h_180/${m.cloudinary_public_id}`}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-ivory">
                      #{index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(m.id)}
                      className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || selectedMedia.length === 0}
              className="bg-cyan-glow text-ink hover:bg-cyan-glow/90 font-semibold"
            >
              {isPending ? "Saving Story..." : `Save All ${selectedMedia.length} Photos`}
            </Button>
          </div>
        </div>
      </div>

      {pickerOpen && (
        <MediaPicker
          multiple={true}
          folder="photo"
          initiallySelectedIds={selectedMedia.map((m) => m.id)}
          onSelect={(items) => {
            setSelectedMedia(items);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

