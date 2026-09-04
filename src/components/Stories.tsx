"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";

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
}: {
  stories?: StoryItem[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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

  return (
    <section id="stories" className="section-padding bg-ink border-t border-border/50">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-label mb-4">Journal</h2>
          <h3 className="heading-section mb-6">Visual Stories</h3>
          <div className="gold-line mx-auto mb-6" />
          <p className="text-stone max-w-2xl mx-auto">
            Deep-dives into specific assignments, field notes, and editorial essays.
          </p>

          {uniqueCategories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  selectedCategory === "All"
                    ? "bg-cyan-glow text-ink shadow-sm shadow-cyan-glow/20"
                    : "bg-surface text-stone hover:text-ivory border border-border"
                }`}
              >
                All Stories
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-cyan-glow text-ink shadow-sm shadow-cyan-glow/20"
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
          <div className="py-16 text-center border border-dashed border-border rounded-sm">
            <p className="text-stone text-sm">No stories found in this category.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {filteredStories.map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`grid lg:grid-cols-12 gap-8 items-center ${
                  idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`lg:col-span-7 img-card card-3d rounded-xl border border-border/40 overflow-hidden ${
                    idx % 2 === 1 ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="aspect-[16/10] w-full card-3d-inner relative">
                    <SafeImage
                      src={story.cover || undefined}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>

                <div
                  className={`lg:col-span-5 flex flex-col justify-center ${
                    idx % 2 === 1 ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-cyan-glow mb-4">
                    {story.category && (
                      <span className="rounded-full bg-cyan-glow/15 px-2.5 py-0.5 text-cyan-glow text-[11px] font-semibold tracking-wider uppercase border border-cyan-glow/30">
                        {story.category}
                      </span>
                    )}
                    {story.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {story.location}
                      </span>
                    )}
                    {(story.location && (story.story_date || story.readTime)) && <span>•</span>}
                    {story.story_date && <span>{story.story_date}</span>}
                    {(!story.story_date && story.readTime) && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {story.readTime}
                      </span>
                    )}
                  </div>

                  <h4 className="font-display text-3xl md:text-4xl text-ivory mb-4 leading-snug">
                    {story.title}
                  </h4>

                  <p className="text-stone text-base leading-relaxed mb-6">
                    {story.excerpt}
                  </p>

                  <Link href={`/stories/${story.slug}`} className="flex items-center gap-2 text-cyan-glow text-sm font-semibold cursor-pointer group">
                    <span>Read Full Story</span>
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
