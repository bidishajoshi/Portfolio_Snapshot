"use client";

import { motion } from "framer-motion";
import { albums } from "@/data/albums";
import { BookOpen } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";

export default function Albums() {
  return (
    <section id="albums" className="section-padding bg-surface">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album, idx) => (
            <Link href={`/albums/${album.slug}`} key={album.id} className="block">
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group cursor-pointer glass-card rounded-xl overflow-hidden border border-border/40 hover:border-cyan-glow/40 transition-all duration-500 shadow-xl"
            >
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-ink">
                <SafeImage
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-ink/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-cyan-glow font-semibold border border-border/40">
                  {album.photoCount} Photos
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-stone-dim mb-2 font-mono">
                  <span>{album.location}</span>
                  <span>{album.date}</span>
                </div>
                
                <h4 className="font-display text-2xl text-ivory group-hover:text-cyan-glow transition-colors mb-3">
                  {album.title}
                </h4>

                <p className="text-sm text-stone line-clamp-2 leading-relaxed mb-6">
                  {album.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-glow uppercase tracking-wider">
                  <BookOpen size={14} />
                  <span>View Album</span>
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
