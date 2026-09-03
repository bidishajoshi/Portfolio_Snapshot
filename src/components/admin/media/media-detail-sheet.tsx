"use client";

import { useState, useTransition } from "react";
import { X, Trash2, Archive } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renameMedia, getMediaReferences, archiveMedia, deleteMedia } from "@/lib/actions/media";
import { cloudinaryImageUrl, cloudinaryVideoUrl } from "@/lib/cloudinary/url";
import type { Media } from "@/types/database";

export function MediaDetailSheet({
  media,
  onClose,
  onChanged,
}: {
  media: Media;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(media.title);
  const [altText, setAltText] = useState(media.alt_text ?? "");
  const [tagsInput, setTagsInput] = useState(media.tags.join(", "));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [references, setReferences] = useState<{ type: string; label: string }[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      try {
        await renameMedia({
          id: media.id,
          title,
          altText: altText || undefined,
          tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        });
        toast.success("Saved.");
        onChanged();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save.");
      }
    });
  };

  const startDeleteFlow = () => {
    startTransition(async () => {
      const refs = await getMediaReferences(media.id);
      setReferences(refs);
      setConfirmingDelete(true);
    });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteMedia(media.id);
        toast.success("Photo deleted.");
        onChanged();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete.");
      }
    });
  };

  const archive = () => {
    startTransition(async () => {
      try {
        await archiveMedia(media.id);
        toast.success("Photo archived.");
        onChanged();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not archive.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm border border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm text-stone-dim">Edit photo</p>
          <button onClick={onClose} className="text-stone hover:text-ivory">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-sm overflow-hidden bg-ink mb-5 max-h-72 flex items-center justify-center">
          {media.kind === "video" ? (
            <video
              src={cloudinaryVideoUrl(media.cloudinary_public_id)}
              controls
              className="max-h-72 w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryImageUrl(media.cloudinary_public_id, { width: 800 })}
              alt={media.alt_text ?? media.title}
              className="max-h-72 w-full object-contain"
            />
          )}
        </div>

        {!confirmingDelete ? (
          <div className="flex flex-col gap-4">
            <Input label="Name" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              label="Alt text (for accessibility & SEO)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="A short description of the photo"
            />
            <Input
              label="Tags (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="wedding, night, kathmandu"
            />

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={archive} disabled={isPending}>
                  <Archive size={14} /> Archive
                </Button>
                <Button variant="danger" size="sm" onClick={startDeleteFlow} disabled={isPending}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
              <Button size="sm" onClick={save} disabled={isPending || !title.trim()}>
                Save changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {references && references.length > 0 ? (
              <>
                <p className="text-sm text-ivory">
                  This photo is used in {references.length} place{references.length > 1 ? "s" : ""}. Deleting it
                  would break those:
                </p>
                <ul className="text-sm text-stone list-disc list-inside max-h-40 overflow-y-auto">
                  {references.map((ref, i) => (
                    <li key={i}>
                      {ref.type}: {ref.label}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-stone-dim">
                  Remove it from those first, or archive it instead — archived photos stay safely out of the
                  Media Library without breaking anything that already uses them.
                </p>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
                    Cancel
                  </Button>
                  <Button variant="secondary" size="sm" onClick={archive} disabled={isPending}>
                    Archive instead
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-ivory">
                  Delete “{media.title}” permanently? This removes it from Cloudinary too and can&apos;t be undone.
                </p>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={confirmDelete} disabled={isPending}>
                    Delete permanently
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
