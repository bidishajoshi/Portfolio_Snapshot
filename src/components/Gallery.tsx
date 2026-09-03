"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { photos, photoCategories } from "@/data/photos";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import SafeImage from "@/components/ui/SafeImage";

export default function Gallery() {
  const [filter, setFilter] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos = filter === "All" ? photos : photos.filter(p => p.category === filter);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => setLightboxIndex(prev => prev !== null ? (prev + 1) % filteredPhotos.length : null);
  const prevImage = () => setLightboxIndex(prev => prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null);

  return (
    <section id="gallery" className="section-padding bg-surface-raised min-h-screen">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-label mb-4">Gallery</h2>
          <h3 className="heading-section mb-6">Selected Stories</h3>
          <div className="gold-line mx-auto mb-10" />
          
          <div className="flex flex-wrap justify-center gap-3">
            {photoCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={clsx(
                  "px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border",
                  filter === cat 
                    ? "bg-cyan-glow text-ink border-cyan-glow shadow-md shadow-cyan-glow/20" 
                    : "bg-surface/60 text-stone border-border/60 hover:border-cyan-glow/50 hover:text-ivory"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

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
                className="img-card mb-4 rounded-xl overflow-hidden cursor-pointer relative group border border-border/30"
                onClick={() => openLightbox(idx)}
              >
                 <SafeImage
                  src={photo.image}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-cyan-glow text-xs uppercase tracking-widest font-semibold mb-1">{photo.category}</p>
                    <h4 className="text-ivory font-display text-xl">{photo.title}</h4>
                    <p className="text-stone-dim text-xs mt-1">{photo.location} • {photo.date}</p>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
           <button className="absolute top-6 right-6 text-stone hover:text-cyan-glow transition-colors p-2 z-10" onClick={closeLightbox}>
              <X size={32} />
           </button>
           <button className="absolute left-6 text-stone hover:text-cyan-glow transition-colors p-2 z-10" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
              <ChevronLeft size={48} />
           </button>
           
           <SafeImage 
              src={filteredPhotos[lightboxIndex].image} 
              alt={filteredPhotos[lightboxIndex].title}
              className="max-h-[85vh] max-w-[85vw] object-contain shadow-2xl rounded-sm"
              onClick={e => e.stopPropagation()}
           />

           <button className="absolute right-6 text-stone hover:text-cyan-glow transition-colors p-2 z-10" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
              <ChevronRight size={48} />
           </button>

           <div className="absolute bottom-6 text-center w-full bg-ink/80 py-3 backdrop-blur-md border-t border-border/40" onClick={e => e.stopPropagation()}>
              <h4 className="text-ivory font-display text-2xl mb-1">{filteredPhotos[lightboxIndex].title}</h4>
              <p className="text-stone text-sm">{filteredPhotos[lightboxIndex].location} • {filteredPhotos[lightboxIndex].category} • {filteredPhotos[lightboxIndex].date}</p>
           </div>
        </div>
      )}
    </section>
  );
}
