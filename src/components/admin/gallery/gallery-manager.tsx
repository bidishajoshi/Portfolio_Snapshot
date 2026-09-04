"use client";

import { useState } from "react";
import { MediaUploader } from "@/components/admin/media/media-uploader";
import { ContentEditor, type EditableRecord } from "@/components/admin/content-editor";

interface GalleryManagerProps {
  records: EditableRecord[];
  categories: Array<{ id: string; name: string }>;
}

export function GalleryManager({ records, categories }: GalleryManagerProps) {
  const [showUploader, setShowUploader] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-sm border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-ivory">Quick Upload to Gallery</h2>
            <p className="text-xs text-stone mt-0.5">
              Drag & drop photos here to instantly publish them to the homepage portfolio gallery.
            </p>
          </div>
          <button
            onClick={() => setShowUploader((prev) => !prev)}
            className="text-xs text-cyan-glow hover:underline"
          >
            {showUploader ? "Hide uploader" : "Show upload dropzone"}
          </button>
        </div>

        {showUploader && (
          <div className="pt-2">
            <MediaUploader
              folder="photo"
              onUploaded={() => {
                window.location.reload();
              }}
            />
          </div>
        )}
      </div>

      <ContentEditor
        content="photo"
        records={records}
        categories={categories}
      />
    </div>
  );
}
