"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { categories } from "@/data/categories";

export function Categories() {
  const handleCategoryClick = (categoryName: string) => {
    // Scroll to gallery section and set filter if possible
    const gallerySection = document.getElementById("gallery");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth" });
      // Dispatch custom event to let Gallery filter update if needed
      window.dispatchEvent(
        new CustomEvent("filter-category", { detail: categoryName })
      );
    }
  };

  return (
    <section className="section-padding bg-surface/30 relative">
      <div className="section-container">
        <SectionHeading
          label="Specialties"
          title="What I Photograph"
          subtitle="Diverse photography disciplines tailored with creative vision, light control, and deep emotional resonance."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              onClick={() => handleCategoryClick(cat.name)}
              className="group cursor-pointer card-3d"
            >
              <div className="card-3d-inner relative aspect-[4/5] overflow-hidden rounded-sm bg-surface border border-border/50">
                {/* Background Image / Placeholder */}
                <img
                  src={cat.cover}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />

                {/* Base Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent transition-opacity duration-300" />

                {/* Hover Enhanced Overlay */}
                <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Card Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl text-ivory group-hover:text-gold transition-colors duration-300">
                      {cat.name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>

                  <p className="mt-2 text-stone text-xs leading-relaxed opacity-80 group-hover:opacity-100 line-clamp-2 transition-opacity duration-300">
                    {cat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
