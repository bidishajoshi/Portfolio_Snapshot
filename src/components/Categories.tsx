"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";

export default function Categories({ categories: liveCategories }: { categories?: Array<{ id: string; name: string; description: string | null; cover: string }> }) {
  const displayedCategories = liveCategories ?? [];
  return (
    <section className="section-padding bg-ink">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-label mb-4">Portfolio</h2>
          <h3 className="heading-section mb-6">What I Photograph</h3>
          <div className="gold-line mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCategories.map((cat, idx) => (
            <motion.a href="#gallery" onClick={() => window.dispatchEvent(new CustomEvent("filter-category", { detail: cat.name }))}
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="group cursor-pointer block h-[400px] img-card card-3d"
            >
              <div className="card-3d-inner w-full h-full relative rounded-xl overflow-hidden border border-border/40">
                <SafeImage
                  src={cat.cover}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="img-card-overlay !opacity-0 group-hover:!opacity-100 transition-opacity duration-500 bg-gradient-to-t from-ink/95 via-ink/60 to-transparent flex flex-col justify-end p-6">
                  <h4 className="font-display text-2xl text-ivory mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{cat.name}</h4>
                  <p className="text-sm text-stone mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100 line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="flex items-center text-yellow text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                    <span>View Category</span>
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
