"use client";

import { motion } from "framer-motion";
import { BookOpen, Calendar, MapPin } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";

export default function Albums({ albums: liveAlbums }: { albums?: Array<{ id: string; title: string; slug: string; cover: string; location: string | null; date: string; description: string | null; photoCount: number }> }) {
  const displayedAlbums = liveAlbums ?? [];
  return (
    <section id="albums" className="section-padding bg-surface/50 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-label mb-4">Collections</h2>
          <h3 className="heading-section mb-6">Featured Albums</h3>
          <div className="gold-line mx-auto mb-6" />
          <p className="text-stone max-w-2xl mx-auto">
            Thoughtfully curated photographic series captured across Nepal and beyond.
          </p>
        </motion.div>

        {displayedAlbums.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-xl bg-ink/40 max-w-xl mx-auto">
            <p className="text-stone text-sm">Albums will appear here once published from the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedAlbums.map((album, idx) => (
              <Link href={`/albums/${album.slug}`} key={album.id} className="block group">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="cursor-pointer glass-card rounded-xl overflow-hidden border border-border/40 group-hover:border-yellow/50 transition-all duration-500 shadow-xl"
                >
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-ink">
                    <SafeImage
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-ink/85 backdrop-blur-md px-3 py-1 rounded-full text-xs text-yellow font-semibold border border-border/40 shadow-sm">
                      {album.photoCount} {album.photoCount === 1 ? "Photo" : "Photos"}
                    </div>
                  </div>

                  <div className="p-6">
                    {(album.location || album.date) && (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-dim mb-3 font-mono">
                        {album.location && (
                          <span className="inline-flex items-center gap-1 text-ivory/80">
                            <MapPin size={12} className="text-yellow" />
                            <span>{album.location}</span>
                          </span>
                        )}
                        {album.location && album.date && <span>•</span>}
                        {album.date && (
                          <span className="inline-flex items-center gap-1 text-stone">
                            <Calendar size={12} className="text-yellow" />
                            <span>{album.date}</span>
                          </span>
                        )}
                      </div>
                    )}
                    
                    <h4 className="font-display text-2xl text-ivory group-hover:text-yellow transition-colors mb-3">
                      {album.title}
                    </h4>

                    {album.description && (
                      <p className="text-sm text-stone line-clamp-2 leading-relaxed mb-6 font-light">
                        {album.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs font-semibold text-yellow uppercase tracking-wider group-hover:text-ivory transition-colors">
                      <BookOpen size={14} />
                      <span>View Full Album</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
