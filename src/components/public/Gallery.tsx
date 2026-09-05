"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, MapPin } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Lightbox } from "./Lightbox";
import { photos, photoCategories } from "@/data/photos";
import { cn } from "@/lib/utils/cn";

export function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Listen to custom filter event from Categories component
  useEffect(() => {
    const handleCustomFilter = (e: Event) => {
      const category = (e as CustomEvent).detail;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (photoCategories.includes(category as any)) {
        setActiveCategory(category);
      }
    };
    window.addEventListener("filter-category", handleCustomFilter);
    return () => window.removeEventListener("filter-category", handleCustomFilter);
  }, []);

  const filteredPhotos =
    activeCategory === "All"
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  const openLightbox = (index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  const lightboxImages = filteredPhotos.map((p) => ({
    src: p.image,
    title: `${p.title} — ${p.category}`,
    caption: `${p.location} (${p.date})`,
  }));

  return (
    <section id="gallery" className="section-padding bg-ink relative">
      <div className="section-container">
        <SectionHeading
          label="Portfolio"
          title="Selected Stories"
          subtitle="A curated showcase of frozen moments, natural light, and quiet emotions captured across various journeys."
        />

        {/* Filter Bar */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
          {photoCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 text-xs md:text-sm font-medium transition-all duration-300 rounded-sm",
                activeCategory === cat
                  ? "bg-gold text-ink"
                  : "bg-surface text-stone border border-border/50 hover:text-ivory hover:border-stone-dim"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="masonry-grid">
          <AnimatePresence>
            {filteredPhotos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative cursor-pointer overflow-hidden rounded-sm bg-surface border border-border/40"
                onClick={() => openLightbox(idx)}
              >
                {/* Image */}
                <div
                  className={cn(
                    "w-full overflow-hidden",
                    photo.aspect === "portrait"
                      ? "aspect-[3/4]"
                      : photo.aspect === "square"
                      ? "aspect-square"
                      : "aspect-[4/3]"
                  )}
                >
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Hover Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gold font-medium">
                        {photo.category}
                      </span>
                      <h4 className="font-display text-lg text-ivory mt-0.5">
                        {photo.title}
                      </h4>
                      <p className="text-xs text-stone flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-gold/80" />
                        {photo.location} ({photo.date})
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center">
                      <Maximize2 size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-16 text-stone">
            No photographs found for this category.
          </div>
        )}
      </div>

      {/* Lightbox Component */}
      <Lightbox
        images={lightboxImages}
        currentIndex={photoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={() =>
          setPhotoIndex((prev) => (prev + 1) % filteredPhotos.length)
        }
        onPrev={() =>
          setPhotoIndex(
            (prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length
          )
        }
      />
    </section>
  );
}
