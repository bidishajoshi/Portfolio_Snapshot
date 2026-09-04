"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Eye } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import PhotoViewerModal, { PhotoDetailItem } from "@/components/ui/PhotoViewerModal";

interface AlbumDetailClientProps {
  album: {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    event_date?: string | null;
  };
  mediaItems: Array<{
    id: string;
    title: string;
    cloudinary_public_id: string;
    kind: string;
    url: string;
    videoUrl?: string;
  }>;
}

export default function AlbumDetailClient({ album, mediaItems }: AlbumDetailClientProps) {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  const photosForModal: PhotoDetailItem[] = mediaItems
    .filter((item) => item.kind !== "video")
    .map((item) => ({
      id: item.id || item.cloudinary_public_id,
      title: item.title || album.title,
      image: item.url,
      location: album.location,
      date: album.event_date,
      category: "Album",
      description: album.description,
    }));

  return (
    <main className="min-h-screen bg-ink px-6 py-12 md:px-16 md:py-20 text-ivory relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/#albums"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-yellow hover:text-ivory transition-colors mb-10 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to All Albums</span>
        </Link>

        {/* Album Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-yellow mb-3">
            {album.location && (
              <span className="flex items-center gap-1.5 text-ivory/90">
                <MapPin size={13} className="text-yellow" />
                <span>{album.location}</span>
              </span>
            )}
            {album.location && album.event_date && <span>•</span>}
            {album.event_date && (
              <span className="flex items-center gap-1.5 text-stone">
                <Calendar size={13} className="text-yellow" />
                <span>{album.event_date}</span>
              </span>
            )}
            <span className="text-stone-dim">
              ({mediaItems.length} {mediaItems.length === 1 ? "photo" : "photos"})
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ivory mb-4 leading-tight">
            {album.title}
          </h1>

          {album.description && (
            <p className="text-stone text-base md:text-lg leading-relaxed font-light">
              {album.description}
            </p>
          )}
        </div>

        {/* Grid */}
        {mediaItems.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-lg bg-surface/50">
            <p className="text-stone text-sm">No photos have been added to this album yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mediaItems.map((item, idx) => {
              if (item.kind === "video") {
                return (
                  <div
                    key={item.cloudinary_public_id}
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface border border-border/40 shadow-lg"
                  >
                    <video
                      controls
                      className="h-full w-full object-cover"
                      src={item.videoUrl}
                    />
                  </div>
                );
              }

              const modalIdx = photosForModal.findIndex(
                (p) => p.id === (item.id || item.cloudinary_public_id)
              );

              return (
                <div
                  key={item.cloudinary_public_id}
                  onClick={() => setActiveModalIndex(modalIdx >= 0 ? modalIdx : 0)}
                  className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface border border-border/40 shadow-lg cursor-pointer transition-all duration-500 hover:border-cyan-glow/50 hover:shadow-2xl"
                >
                  <SafeImage
                    src={item.url}
                    alt={item.title || album.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-ivory font-bold bg-ink/70 px-4 py-2 rounded-full border border-cyan-glow/40 backdrop-blur-sm">
                      <Eye size={14} className="text-cyan-glow" />
                      <span>View Fullscreen</span>
                    </span>
                  </div>
                  {item.title && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                      <p className="text-xs text-ivory font-medium truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <PhotoViewerModal
        photos={photosForModal}
        currentIndex={activeModalIndex}
        onClose={() => setActiveModalIndex(null)}
        onNext={() =>
          setActiveModalIndex((prev) =>
            prev !== null ? (prev + 1) % photosForModal.length : null
          )
        }
        onPrev={() =>
          setActiveModalIndex((prev) =>
            prev !== null ? (prev - 1 + photosForModal.length) % photosForModal.length : null
          )
        }
        onSelectIndex={(index) => setActiveModalIndex(index)}
      />
    </main>
  );
}
