"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { updateAboutSection } from "@/lib/actions/site-content";
import { cloudinaryImageUrl } from "@/lib/cloudinary/url";
import type { Media } from "@/types/database";

interface AboutManagerProps {
  initialTitle?: string | null;
  initialSubtitle?: string | null;
  initialBio?: string | null;
  initialMediaId?: string | null;
  initialPublicId?: string | null;
}

export function AboutManager({
  initialTitle,
  initialSubtitle,
  initialBio,
  initialMediaId,
  initialPublicId,
}: AboutManagerProps) {
  const [title, setTitle] = useState(initialTitle || "");
  const [subtitle, setSubtitle] = useState(initialSubtitle || "");
  const [bio, setBio] = useState(initialBio || "");
  const [mediaId, setMediaId] = useState<string | null>(initialMediaId || null);
  const [publicId, setPublicId] = useState<string | null>(initialPublicId || null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateAboutSection({
          title,
          subtitle,
          bio,
          mediaId,
        });
        toast.success("About content saved successfully.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save about content.");
      }
    });
  };

  const handleMediaSelected = (selected: Media[]) => {
    if (selected.length > 0) {
      setMediaId(selected[0].id);
      setPublicId(selected[0].cloudinary_public_id);
    }
  };

  const portraitUrl = publicId
    ? cloudinaryImageUrl(publicId, { width: 600, height: 800, crop: "fill" })
    : null;

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="grid md:grid-cols-12 gap-8 bg-surface border border-border rounded-sm p-6">
        {/* Photo Column */}
        <div className="md:col-span-5 flex flex-col items-center">
          <label className="text-xs uppercase tracking-wider text-stone-dim mb-3 font-semibold self-start">
            Photographer Portrait
          </label>
          <div className="relative aspect-[3/4] w-full max-w-[260px] rounded-sm overflow-hidden bg-surface-raised border border-border group mb-4">
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt="Portrait preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone gap-2 p-4 text-center">
                <Camera size={32} className="opacity-40" />
                <span className="text-xs">No custom portrait selected. Default image will be used.</span>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setPickerOpen(true)}
            className="w-full max-w-[260px]"
          >
            {mediaId ? "Change Portrait" : "Select / Upload Portrait"}
          </Button>
        </div>

        {/* Text Details Column */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <Input
            label="Section Title"
            value={title}
            placeholder="Behind the Lens"
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Subtitle"
            value={subtitle}
            placeholder="Photographer & Visual Storyteller"
            onChange={(e) => setSubtitle(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-stone">Biography / Story</label>
            <p className="text-xs text-stone-dim mb-1">
              Separate paragraphs with an empty blank line.
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={8}
              placeholder="Photography, for me, has never been about pressing a shutter button..."
              className="bg-ink border border-border rounded-sm px-3.5 py-2.5 text-sm text-ivory outline-none focus:border-gold resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button size="sm" onClick={handleSave} disabled={pending}>
              {pending ? "Saving..." : "Save About Content"}
            </Button>
          </div>
        </div>
      </div>

      {pickerOpen && (
        <MediaPicker
          folder="profile"
          multiple={false}
          onSelect={handleMediaSelected}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
