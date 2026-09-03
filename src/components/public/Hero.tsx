"use client";

import { motion } from "framer-motion";
import { ChevronDown, Aperture } from "lucide-react";
import { brand } from "@/data/site";

export function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src="/images/placeholder/hero.jpg"
          alt="Photographer overlooking Himalayan mountains at golden hour"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/40 to-ink/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Floating camera element */}
        <motion.div
          className="inline-flex items-center justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Aperture
            size={32}
            className="text-gold opacity-70 animate-float"
            strokeWidth={1}
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          className="heading-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-ivory"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {brand.name}
        </motion.h1>

        {/* Photographer Name */}
        <motion.p
          className="mt-4 text-sm md:text-base tracking-[0.25em] uppercase text-stone font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {brand.photographer}
        </motion.p>

        {/* Gold Line */}
        <motion.hr
          className="gold-line mx-auto mt-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{ transformOrigin: "center" }}
        />

        {/* Tagline */}
        <motion.p
          className="mt-6 font-display italic text-lg md:text-xl lg:text-2xl text-ivory/90 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          &ldquo;{brand.tagline}&rdquo;
        </motion.p>

        {/* Supporting Text */}
        <motion.p
          className="mt-3 text-sm md:text-base text-stone max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {brand.supportingText}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <button
            onClick={() => scrollTo("gallery")}
            className="px-8 py-3 text-sm font-medium bg-gold text-ink rounded-sm hover:bg-gold-soft transition-colors duration-300"
          >
            Explore My Work
          </button>
          <button
            onClick={() => scrollTo("contact")}
            className="px-8 py-3 text-sm font-medium border border-ivory/30 text-ivory rounded-sm hover:border-ivory/60 hover:bg-ivory/5 transition-all duration-300"
          >
            Book a Shoot
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone/60 hover:text-stone transition-colors"
        onClick={() => scrollTo("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        aria-label="Scroll down"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <ChevronDown size={16} className="animate-scroll-hint" />
      </motion.button>
    </section>
  );
}
