"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Sparkles, MapPin } from "lucide-react";
import clsx from "clsx";
import SafeImage from "@/components/ui/SafeImage";

export default function Gallery({
  photos: livePhotos,
  categories: liveCategories,
}: {
  photos?: Array<{
    id: string;
    title: string;
    category: string;
    image: string;
    location: string;
    date: string;
    aspect?: "portrait" | "landscape" | "square";
  }>;
  categories?: string[];
}) {
  const [filter, setFilter] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const displayedPhotos = livePhotos ?? [];
  const photoCategories = Array.from(new Set(displayedPhotos.map((p) => p.category).filter(Boolean)));
  const combinedCategories = Array.from(new Set([...(liveCategories ?? []), ...photoCategories]));
  const displayedCategories = ["All", ...combinedCategories];

  useEffect(() => {
    const handleCategoryFilter = (event: Event) => {
      const category = (event as CustomEvent<string>).detail;
      if (displayedCategories.includes(category)) setFilter(category);
    };
    window.addEventListener("filter-category", handleCategoryFilter);
    return () => window.removeEventListener("filter-category", handleCategoryFilter);
  }, [liveCategories, displayedCategories]);

  const filteredPhotos = filter === "All" ? displayedPhotos : displayedPhotos.filter((p) => p.category === filter);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : null));
  }, [filteredPhotos.length]);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null));
  }, [filteredPhotos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, nextImage, prevImage]);

  return (
    <section id="gallery" className="section-padding bg-surface-raised min-h-screen relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute -top-40 right-0 w-96 h-96 bg-cyan-glow/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-cyan-glow/20 text-cyan-glow text-xs uppercase tracking-widest font-mono mb-4">
            <Camera size={12} />
            <span>Curated Portfolio</span>
          </div>
          <h2 className="heading-section mb-4">Selected Stories</h2>
          <p className="text-stone text-sm max-w-md mx-auto">
            A glimpse into moments immortalized through the lens of DR DSLR.
          </p>
          <div className="gold-line mx-auto my-6" />

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
            {displayedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border",
                  filter === cat
                    ? "bg-cyan-glow text-ink border-cyan-glow shadow-md shadow-cyan-glow/20 scale-105 font-bold"
                    : "bg-surface/80 text-stone border-border/60 hover:border-cyan-glow/50 hover:text-ivory"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {filteredPhotos.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-border rounded-2xl bg-surface/30">
            <Camera size={36} className="mx-auto text-stone-dim mb-3" />
            <p className="text-stone text-sm">No photographs found in this category yet.</p>
          </div>
        ) : (
          <motion.div layout className="masonry-grid">
            <AnimatePresence>
              {filteredPhotos.map((photo, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  key={photo.id}
                  className="img-card mb-4 rounded-xl overflow-hidden cursor-pointer relative group border border-border/40 hover:border-cyan-glow/50 shadow-lg transition-all"
                  onClick={() => openLightbox(idx)}
                >
                  <SafeImage
                    src={photo.image}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Category Pill Tag always visible on top right */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold bg-black/75 backdrop-blur-md text-ivory border border-white/10 group-hover:border-cyan-glow/50 group-hover:text-cyan-glow transition-colors">
                      {photo.category}
                    </span>
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <h4 className="text-ivory font-display text-xl leading-tight">{photo.title}</h4>
                    <div className="flex items-center gap-3 text-stone-dim text-xs mt-1.5">
                      {photo.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} className="text-cyan-glow" />
                          {photo.location}
                        </span>
                      )}
                      {photo.date && <span>• {photo.date}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div className="lightbox-overlay z-50 flex flex-col items-center justify-between p-4" onClick={closeLightbox}>
          {/* Header Controls */}
          <div className="w-full flex items-center justify-between px-4 py-2 z-20" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs font-mono text-stone-dim">
              {lightboxIndex + 1} / {filteredPhotos.length}
            </span>
            <button
              className="text-stone hover:text-cyan-glow transition-colors p-2 rounded-full hover:bg-white/5"
              onClick={closeLightbox}
              title="Close (Esc)"
            >
              <X size={28} />
            </button>
          </div>

          {/* Main Image with Navigation Arrows */}
          <div className="relative flex-1 flex items-center justify-center w-full max-h-[75vh]" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute left-2 sm:left-6 text-stone hover:text-cyan-glow transition-colors p-3 rounded-full hover:bg-white/10 z-20"
              onClick={prevImage}
              title="Previous (Left Arrow)"
            >
              <ChevronLeft size={40} />
            </button>

            <SafeImage
              src={filteredPhotos[lightboxIndex].image}
              alt={filteredPhotos[lightboxIndex].title}
              className="max-h-[75vh] max-w-[88vw] object-contain shadow-2xl rounded-lg select-none"
            />

            <button
              className="absolute right-2 sm:right-6 text-stone hover:text-cyan-glow transition-colors p-3 rounded-full hover:bg-white/10 z-20"
              onClick={nextImage}
              title="Next (Right Arrow)"
            >
              <ChevronRight size={40} />
            </button>
          </div>

          {/* Bottom Info Bar & Thumbnails */}
          <div
            className="w-full max-w-4xl bg-ink/90 p-4 rounded-xl border border-border/50 backdrop-blur-md flex flex-col items-center gap-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h4 className="text-ivory font-display text-xl mb-0.5">{filteredPhotos[lightboxIndex].title}</h4>
              <p className="text-stone text-xs flex items-center justify-center gap-2">
                <span className="text-cyan-glow font-medium">{filteredPhotos[lightboxIndex].category}</span>
                {filteredPhotos[lightboxIndex].location && <span>• {filteredPhotos[lightboxIndex].location}</span>}
                {filteredPhotos[lightboxIndex].date && <span>• {filteredPhotos[lightboxIndex].date}</span>}
              </p>
            </div>

            {/* Thumbnail Strip */}
            {filteredPhotos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 scrollbar-thin">
                {filteredPhotos.map((thumb, tIdx) => (
                  <button
                    key={thumb.id}
                    onClick={() => setLightboxIndex(tIdx)}
                    className={clsx(
                      "relative w-12 h-12 rounded overflow-hidden shrink-0 border transition-all",
                      lightboxIndex === tIdx
                        ? "border-cyan-glow scale-105 shadow-md shadow-cyan-glow/20"
                        : "border-border/40 opacity-50 hover:opacity-100"
                    )}
                  >
                    <SafeImage src={thumb.image} alt={thumb.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

