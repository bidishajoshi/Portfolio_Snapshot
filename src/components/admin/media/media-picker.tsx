"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, X, Check, UploadCloud } from "lucide-react";
import { searchMedia } from "@/lib/actions/media";
import { cloudinaryImageUrl, cloudinaryVideoThumbUrl } from "@/lib/cloudinary/url";
import { MediaUploader } from "@/components/admin/media/media-uploader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Media, MediaFolder } from "@/types/database";

interface MediaPickerProps {
  folder?: MediaFolder;
  multiple?: boolean;
  onSelect: (media: Media[]) => void;
  onClose: () => void;
  /** Media already attached, so the picker opens with them pre-checked. */
  initiallySelectedIds?: string[];
}

/**
 * The picker every "Add Photos" button in the CMS opens. The admin only
 * ever sees titles and thumbnails here — never a Cloudinary ID, URL, or
 * database UUID (spec section 7).
 */
export function MediaPicker({
  folder,
  multiple = true,
  onSelect,
  onClose,
  initiallySelectedIds = [],
}: MediaPickerProps) {
  const [items, setItems] = useState<Media[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initiallySelectedIds));
  const [selectedItems, setSelectedItems] = useState<Map<string, Media>>(new Map());
  const [tab, setTab] = useState<"browse" | "upload">("browse");
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const result = await searchMedia({ query: query || undefined, folder, pageSize: 60 });
      setItems(result.items);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const toggle = (media: Media) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(media.id)) {
        next.delete(media.id);
      } else {
        if (!multiple) next.clear();
        next.add(media.id);
      }
      return next;
    });
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(media.id)) {
        next.delete(media.id);
      } else {
        if (!multiple) next.clear();
        next.set(media.id, media);
      }
      return next;
    });
  };

  const confirm = () => {
    onSelect(Array.from(selectedItems.values()));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-sm border border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex gap-1">
            <button
              onClick={() => setTab("browse")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-sm",
                tab === "browse" ? "bg-surface-raised text-ivory" : "text-stone"
              )}
            >
              Add Photos
            </button>
            <button
              onClick={() => setTab("upload")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-sm",
                tab === "upload" ? "bg-surface-raised text-ivory" : "text-stone"
              )}
            >
              <UploadCloud size={14} /> Upload New
            </button>
          </div>
          <button onClick={onClose} className="text-stone hover:text-ivory">
            <X size={18} />
          </button>
        </div>

        {tab === "browse" ? (
          <>
            <div className="px-5 py-3 border-b border-border">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-dim" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search photos…"
                  className="w-full bg-ink border border-border rounded-sm pl-9 pr-3 py-2 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isPending && items.length === 0 && (
                <p className="text-sm text-stone-dim py-12 text-center">Loading…</p>
              )}
              {!isPending && items.length === 0 && (
                <p className="text-sm text-stone-dim py-12 text-center">No photos found.</p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {items.map((item) => {
                  const checked = selectedIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item)}
                      className={cn(
                        "group relative aspect-square rounded-sm overflow-hidden border transition-colors text-left",
                        checked ? "border-gold" : "border-border hover:border-stone-dim"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          item.kind === "video"
                            ? cloudinaryVideoThumbUrl(item.cloudinary_public_id, 260)
                            : cloudinaryImageUrl(item.cloudinary_public_id, { width: 260, height: 260, crop: "fill" })
                        }
                        alt={item.alt_text ?? item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1.5 py-1">
                        <p className="text-[11px] text-ivory truncate">{item.title}</p>
                      </div>
                      {checked && (
                        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-gold flex items-center justify-center">
                          <Check size={12} className="text-ink" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-border">
              <p className="text-xs text-stone-dim">{selectedIds.size} selected</p>
              <Button size="sm" onClick={confirm} disabled={selectedIds.size === 0}>
                Add Selected
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <MediaUploader
              folder={folder ?? "photo"}
              onUploaded={(media) => {
                setItems((prev) => [media, ...prev]);
                toggle(media);
                setTab("browse");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
