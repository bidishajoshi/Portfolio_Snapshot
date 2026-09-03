"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { searchMedia } from "@/lib/actions/media";
import { cloudinaryImageUrl, cloudinaryVideoThumbUrl } from "@/lib/cloudinary/url";
import { MediaDetailSheet } from "@/components/admin/media/media-detail-sheet";
import type { Media, MediaFolder } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const FOLDER_TABS: { key: MediaFolder | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "photo", label: "Photos" },
  { key: "video", label: "Videos" },
  { key: "hero", label: "Hero" },
  { key: "profile", label: "Profile" },
  { key: "album", label: "Albums" },
  { key: "story", label: "Stories" },
  { key: "film", label: "Films" },
  { key: "service", label: "Services" },
  { key: "testimonial", label: "Testimonials" },
  { key: "other", label: "Other" },
];

export function MediaGrid({ refreshKey }: { refreshKey?: number }) {
  const [items, setItems] = useState<Media[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState<MediaFolder | "all">("all");
  const [selected, setSelected] = useState<Media | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const result = await searchMedia({
        query: query || undefined,
        folder: folder === "all" ? undefined : folder,
        pageSize: 60,
      });
      setItems(result.items);
      setTotal(result.total);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, refreshKey]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos…"
            className="w-full bg-surface border border-border rounded-sm pl-9 pr-3 py-2 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
          />
        </div>
        <p className="text-xs text-stone-dim">{total} item(s)</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FOLDER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFolder(tab.key)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs whitespace-nowrap transition-colors",
              folder === tab.key
                ? "bg-gold text-ink"
                : "bg-surface text-stone border border-border hover:border-stone-dim"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isPending && items.length === 0 && (
        <p className="text-sm text-stone-dim py-12 text-center">Loading…</p>
      )}

      {!isPending && items.length === 0 && (
        <div className="py-16 text-center border border-dashed border-border rounded-sm">
          <p className="text-sm text-stone">No photos here yet.</p>
          <p className="text-xs text-stone-dim mt-1">Upload some above to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="group relative aspect-square rounded-sm overflow-hidden bg-surface border border-border hover:border-gold transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                item.kind === "video"
                  ? cloudinaryVideoThumbUrl(item.cloudinary_public_id, 300)
                  : cloudinaryImageUrl(item.cloudinary_public_id, { width: 300, height: 300, crop: "fill" })
              }
              alt={item.alt_text ?? item.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-ivory truncate text-left">{item.title}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <MediaDetailSheet
          media={selected}
          onClose={() => setSelected(null)}
          onChanged={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}
