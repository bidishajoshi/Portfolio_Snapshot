"use client";

import { useState } from "react";
import { MediaUploader } from "@/components/admin/media/media-uploader";
import { MediaGrid } from "@/components/admin/media/media-grid";

export default function MediaLibraryPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Media Library</h1>
        <p className="text-stone text-sm mt-1">
          Upload photos once, then reuse them anywhere on the site — albums, the homepage, films, stories.
        </p>
      </div>

      <MediaUploader folder="photo" onUploaded={() => setRefreshKey((k) => k + 1)} />

      <MediaGrid refreshKey={refreshKey} />
    </div>
  );
}
