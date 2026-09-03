"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Video, Plus } from "lucide-react";
import { toast } from "sonner";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { assignContentMedia } from "@/lib/actions/content-media";
import type { Media } from "@/types/database";

export interface ContentMediaRecord {
  id: string;
  title: string;
  coverMediaId?: string | null;
  videoMediaId?: string | null;
  galleryCount?: number;
}

export function ContentMediaManager({
  content,
  records,
}: {
  content: "service" | "film" | "story";
  records: ContentMediaRecord[];
}) {
  const [picker, setPicker] = useState<{ id: string; field: "cover" | "video" | "gallery" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const label = content === "service" ? "service" : content;
  const folder = content === "film" ? "film" : content === "story" ? "story" : "service";

  const choose = (media: Media[]) => {
    if (!picker || media.length === 0) return;
    const target = picker;
    startTransition(async () => {
      try {
        for (const item of media) {
          await assignContentMedia({ content, contentId: target.id, mediaId: item.id, field: target.field });
        }
        toast.success("Media attached.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not attach media.");
      } finally {
        setPicker(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {records.length === 0 && <p className="py-12 text-center text-sm text-stone">No {label}s yet.</p>}
      {records.map((record) => (
        <div key={record.id} className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-surface px-4 py-3">
          <p className="min-w-40 flex-1 text-sm text-ivory">{record.title}</p>
          <button disabled={isPending} onClick={() => setPicker({ id: record.id, field: "cover" })} className="flex items-center gap-1.5 text-xs text-stone hover:text-gold" title="Attach cover media">
            <ImagePlus size={15} /> Cover
          </button>
          {content === "film" && <button disabled={isPending} onClick={() => setPicker({ id: record.id, field: "video" })} className="flex items-center gap-1.5 text-xs text-stone hover:text-gold" title="Attach video media"><Video size={15} /> Video</button>}
          {content !== "service" && <button disabled={isPending} onClick={() => setPicker({ id: record.id, field: "gallery" })} className="flex items-center gap-1.5 text-xs text-stone hover:text-gold" title="Add gallery media"><Plus size={15} /> Gallery ({record.galleryCount ?? 0})</button>}
        </div>
      ))}
      {picker && <MediaPicker folder={folder} multiple={picker.field === "gallery"} onSelect={choose} onClose={() => setPicker(null)} />}
    </div>
  );
}
