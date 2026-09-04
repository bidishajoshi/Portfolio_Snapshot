"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { setHeroBackground } from "@/lib/actions/site-content";
import { cloudinaryImageUrl } from "@/lib/cloudinary/url";
import type { Media } from "@/types/database";

export function HeroSlideManager({
  currentMedia,
}: {
  currentMedia?: { id: string; cloudinary_public_id: string; title: string } | null;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSelectMedia = (items: Media[]) => {
    const selected = items[0];
    if (!selected) return;

    startTransition(async () => {
      try {
        await setHeroBackground(selected.id);
        toast.success("Hero background updated.");
        window.location.reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not update hero photo.");
      }
    });
  };

  return (
    <div className="rounded-sm border border-border bg-surface p-5">
      <h2 className="text-lg font-display text-ivory mb-1">Hero Background Photo</h2>
      <p className="text-xs text-stone mb-4">
        The main full-screen image displayed at the very top of the website.
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="h-32 w-48 rounded-sm overflow-hidden bg-ink border border-border shrink-0">
          {currentMedia ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryImageUrl(currentMedia.cloudinary_public_id, {
                width: 400,
                height: 250,
                crop: "fill",
              })}
              alt={currentMedia.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-stone-dim">
              No hero photo selected
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {currentMedia && (
            <p className="text-xs text-stone-dim">
              Current: <span className="text-ivory">{currentMedia.title}</span>
            </p>
          )}
          <Button
            size="sm"
            onClick={() => setPickerOpen(true)}
            disabled={isPending}
          >
            {currentMedia ? "Change Hero Photo" : "Upload / Choose Hero Photo"}
          </Button>
        </div>
      </div>

      {pickerOpen && (
        <MediaPicker
          multiple={false}
          folder="hero"
          onSelect={onSelectMedia}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
