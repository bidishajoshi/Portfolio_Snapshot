"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, ArrowRight, Eye, Calendar, Tag } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import PhotoViewerModal, { PhotoDetailItem } from "@/components/ui/PhotoViewerModal";

export interface StoryItem {
  id: string;
  title: string;
  introduction?: string | null;
  location?: string | null;
  story_date?: string | null;
  slug?: string;
  cover?: string | null;
  excerpt?: string | null;
  date?: string | null;
  readTime?: string;
  category?: string | null;
}

export default function Stories({
  stories: liveStories,
  title,
  subtitle,
  description,
}: {
  stories?: StoryItem[];
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  const displayedStories = (liveStories ?? []).map((story) => ({
    id: story.id,
    title: story.title,
    introduction: story.introduction ?? story.excerpt ?? "",
    location: story.location ?? "",
    story_date: story.story_date ?? story.date ?? null,
    cover: story.cover ?? "",
    excerpt: story.excerpt ?? story.introduction ?? "",
    date: story.date ?? story.story_date ?? "",
    readTime: story.readTime ?? "",
    slug: story.slug ?? story.title.toLowerCase().replace(/\s+/g, "-"),
    category: story.category ?? null,
  }));

  const uniqueCategories = Array.from(
    new Set(displayedStories.map((s) => s.category).filter((c): c is string => Boolean(c)))
  );

  const filteredStories =
    selectedCategory === "All"
      ? displayedStories
      : displayedStories.filter((s) => s.category === selectedCategory);

  const modalPhotos: PhotoDetailItem[] = filteredStories.map((s) => ({
    id: s.id,
    title: s.title,
    image: s.cover,
    location: s.location || null,
    date: s.story_date || s.date || null,
    category: s.category || null,
    description: s.excerpt || s.introduction || null,
  }));

  return (
    <section id="stories" className="section-padding bg-ink relative border-t border-border/50 overflow-hidden">
      {/* Subtle atmospheric ambient glow: Maroon & Warm Yellow */}
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-maroon-deep/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[450px] h-[450px] bg-yellow/12 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-yellow/30 text-yellow text-xs uppercase tracking-widest font-mono mb-4 shadow-sm">
            <span>{subtitle || "Editorial Journal"}</span>
          </div>
          <h2 className="heading-section mb-4">{title || "Visual Stories"}</h2>
          <p className="text-stone max-w-xl mx-auto text-sm md:text-base">
            {description || "Narrative-driven assignments, field notes, and intimate photographic chronicles."}
          </p>
          <div className="gold-line mx-auto mt-6" />

          {uniqueCategories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-ink shadow-md shadow-amber-500/25 font-bold"
                    : "bg-surface text-stone hover:text-ivory border border-border"
                }`}
              >
                All Stories
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-ink shadow-md shadow-amber-500/25 font-bold"
                      : "bg-surface text-stone hover:text-ivory border border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {filteredStories.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-xl bg-surface/30">
            <p className="text-stone text-sm">No visual stories found in this category.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {filteredStories.map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`grid lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                  idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Photo container with click-to-view lightbox */}
                <div
                  onClick={() => setActiveModalIndex(idx)}
                  className={`lg:col-span-7 rounded-2xl border border-border/60 hover:border-yellow/50 overflow-hidden relative group cursor-pointer shadow-2xl transition-all duration-500 bg-ink ${
                    idx % 2 === 1 ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="aspect-[16/10] w-full relative overflow-hidden">
                    <SafeImage
                      src={story.cover || undefined}
                      alt={story.title}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Category pill on top right */}
                    {story.category && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold bg-black/80 backdrop-blur-md text-ivory border border-white/10 group-hover:border-yellow/50 group-hover:text-yellow transition-colors">
                          {story.category}
                        </span>
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-yellow font-mono font-semibold">
                          Click to View Full Photo
                        </p>
                        <p className="text-ivory font-display text-lg mt-0.5">{story.title}</p>
                      </div>
                      <span className="p-2.5 rounded-full bg-yellow/20 border border-yellow/40 text-yellow shadow-md">
                        <Eye size={18} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Editorial Details side */}
                <div
                  className={`lg:col-span-5 flex flex-col justify-center ${
                    idx % 2 === 1 ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono mb-4">
                    {story.location && (
                      <span className="flex items-center gap-1.5 text-ivory/90">
                        <MapPin size={13} className="text-yellow" />
                        <span>{story.location}</span>
                      </span>
                    )}
                    {story.location && (story.story_date || story.date) && (
                      <span className="text-stone-dim">•</span>
                    )}
                    {(story.story_date || story.date) && (
                      <span className="flex items-center gap-1.5 text-stone">
                        <Calendar size={13} className="text-yellow" />
                        <span>{story.story_date || story.date}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-3xl md:text-4xl text-ivory mb-4 leading-tight tracking-tight">
                    {story.title}
                  </h3>

                  <p className="text-stone text-sm md:text-base leading-relaxed mb-6 font-normal">
                    {story.excerpt}
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveModalIndex(idx)}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-yellow hover:text-ivory transition-colors cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>View Photo</span>
                    </button>
                    <span className="text-stone-dim text-xs">•</span>
                    <Link
                      href={`/stories/${story.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-stone hover:text-yellow transition-colors group cursor-pointer"
                    >
                      <span>Story Details</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Modal for detailed photo view */}
      <PhotoViewerModal
        photos={modalPhotos}
        currentIndex={activeModalIndex}
        onClose={() => setActiveModalIndex(null)}
        onNext={() =>
          setActiveModalIndex((prev) =>
            prev !== null ? (prev + 1) % modalPhotos.length : null
          )
        }
        onPrev={() =>
          setActiveModalIndex((prev) =>
            prev !== null ? (prev - 1 + modalPhotos.length) % modalPhotos.length : null
          )
        }
        onSelectIndex={(index) => setActiveModalIndex(index)}
      />
    </section>
  );
}

