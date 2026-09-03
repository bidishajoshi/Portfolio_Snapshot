"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { AnimatedCounter } from "./AnimatedCounter";
import { aboutContent, stats } from "@/data/site";

export function About() {
  return (
    <section id="about" className="section-padding relative overflow-hidden bg-ink">
      <div className="section-container">
        <SectionHeading
          label="About the Photographer"
          title={aboutContent.title}
          subtitle={aboutContent.subtitle}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Portrait Image Column */}
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame */}
              <div className="absolute -inset-3 border border-gold/20 rounded-sm translate-x-2 translate-y-2 pointer-events-none" />
              
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-surface">
                <img
                  src={aboutContent.portrait}
                  alt={aboutContent.subtitle}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </motion.div>

          {/* Bio Text & Stats Column */}
          <motion.div
            className="lg:col-span-7 flex flex-col justify-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-6 text-stone text-base md:text-lg leading-relaxed">
              {aboutContent.bio.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Statistics */}
            <div className="mt-12 pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="font-display text-3xl sm:text-4xl text-gold font-normal">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs uppercase tracking-wider text-stone-dim font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
