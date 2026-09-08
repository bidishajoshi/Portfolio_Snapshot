"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { addHeroSlidesBulk, removeHeroSlide } from "@/lib/actions/site-content";
import { cloudinaryImageUrl } from "@/lib/cloudinary/url";
import SafeImage from "@/components/ui/SafeImage";
import type { Media } from "@/types/database";

export interface HeroSlideItem {
  id: string;
  media_id: string;
  media?: {
    id: string;
    cloudinary_public_id?: string | null;
    secure_url?: string | null;
    public_id?: string | null;
    title: string;
  } | null;
}

export function HeroSlideManager({
  slides: initialSlides = [],
}: {
  slides?: HeroSlideItem[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddMedia = (items: Media[]) => {
    if (!items.length) return;

    if (initialSlides.length >= 10) {
      toast.error("Maximum 10 hero photos allowed.");
      return;
    }

    const mediaIds = items.map((it) => it.id);

    startTransition(async () => {
      try {
        await addHeroSlidesBulk(mediaIds);
        toast.success(`Selected hero photo(s) added to slider.`);
        setPickerOpen(false);
        window.location.reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not add hero photos.");
      }
    });
  };

  const handleRemoveSlide = (slide: HeroSlideItem) => {
    if (initialSlides.length <= 1) {
      toast.error("Minimum 1 hero photo is required.");
      return;
    }

    if (!confirm("Remove this photo from the hero slider?")) return;

    startTransition(async () => {
      try {
        await removeHeroSlide(slide.id);
        toast.success("Hero photo removed.");
        window.location.reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not remove photo.");
      }
    });
  };

  return (
    <div className="rounded-sm border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-display text-ivory flex items-center gap-2">
            <Images size={20} className="text-amber-400" />
            <span>Home Page Hero Photo Slider</span>
          </h2>
          <p className="text-xs text-stone mt-1">
            Manage the full-screen photo slider on the homepage. Select minimum 1 and maximum 10 high-quality photos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface-raised border border-border text-ivory">
            {initialSlides.length} / 10 Photos
          </span>

          <Button
            size="sm"
            onClick={() => setPickerOpen(true)}
            disabled={isPending || initialSlides.length >= 10}
            className="flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Hero Photo
          </Button>
        </div>
      </div>

      {/* Grid of configured Hero Photos */}
      {initialSlides.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-sm bg-ink/30">
          <p className="text-xs text-stone mb-3">No hero photos selected yet.</p>
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            Choose Photo from Media Library
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialSlides.map((slide, idx) => {
            const media = slide.media;
            const imgId = media ? media.secure_url || media.cloudinary_public_id || media.public_id : null;
            const imgUrl = imgId ? cloudinaryImageUrl(imgId) : null;

            return (
              <div
                key={slide.id}
                className="relative rounded-lg border border-border bg-ink overflow-hidden group shadow-md flex flex-col justify-between"
              >
                {/* Badge Number */}
                <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded text-[11px] font-mono text-amber-400 font-bold border border-white/10">
                  Slide #{idx + 1}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(slide)}
                  disabled={isPending || initialSlides.length <= 1}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded bg-black/80 backdrop-blur-md text-stone hover:text-danger hover:bg-black transition-colors disabled:opacity-30 cursor-pointer"
                  title={initialSlides.length <= 1 ? "Minimum 1 photo required" : "Remove photo"}
                >
                  <Trash2 size={14} />
                </button>

                <div className="aspect-[16/10] w-full relative overflow-hidden bg-ink">
                  {imgUrl ? (
                    <SafeImage
                      src={imgUrl}
                      alt={media?.title || "Hero Slide"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-dim">
                      No Preview
                    </div>
                  )}
                </div>

                <div className="p-3 bg-surface border-t border-border/60 flex items-center justify-between">
                  <p className="text-xs text-ivory font-medium truncate max-w-[200px]">
                    {media?.title || "Hero Photo"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pickerOpen && (
        <MediaPicker
          multiple={true}
          folder="hero"
          onSelect={handleAddMedia}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
