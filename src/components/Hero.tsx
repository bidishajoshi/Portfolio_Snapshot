"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { brand } from "@/data/site";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";

interface HeroProps {
  brandOverride?: {
    name: string;
    photographer: string;
    tagline: string;
    supportingText?: string | null;
  };
  backgroundImage?: string | null;
  backgroundImages?: string[];
}

export default function Hero({
  brandOverride,
  backgroundImage,
  backgroundImages,
}: HeroProps) {
  const displayedBrand = brandOverride ?? brand;

  const images =
    backgroundImages && backgroundImages.length > 0
      ? backgroundImages
      : backgroundImage
      ? [backgroundImage]
      : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Reset auto-slide 20-second timer whenever user manually moves or slide changes
  useEffect(() => {
    if (images.length <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 20000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, images.length, nextSlide]);

  // Preload next slide image in browser cache for instant transitions
  useEffect(() => {
    if (images.length <= 1) return;
    const nextIdx = (currentIndex + 1) % images.length;
    const img = new Image();
    img.src = images[nextIdx];
  }, [currentIndex, images]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
    setTouchStart(null);
  };

  return (
    <section
      id="home"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-ink select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Photo Slider Background - Full Page Edge-to-Edge */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/20 to-ink/90 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-at-c from-cyan-glow/10 via-transparent to-transparent opacity-30 pointer-events-none z-10" />

        {images.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <SafeImage
                src={images[currentIndex]}
                alt="Hero Photography"
                className="w-full h-full object-cover object-center transition-transform duration-1000 scale-105"
              />
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-20 text-center flex flex-col items-center px-6 mt-16 max-w-4xl mx-auto pointer-events-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-ivory text-xs sm:text-sm tracking-[0.35em] uppercase font-semibold mb-4"
        >
          {displayedBrand.photographer}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-ivory via-cyan-glow to-maroon-deep mb-6 leading-tight drop-shadow-lg font-bold"
        >
          {displayedBrand.name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-20 h-[2px] bg-gradient-to-r from-cyan-glow to-blue-500 mb-6 shadow-glow"
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="font-display italic text-xl sm:text-2xl md:text-3xl text-ivory/95 mb-4"
        >
          &quot;{displayedBrand.tagline}&quot;
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-stone max-w-xl mb-10 text-base sm:text-lg leading-relaxed"
        >
          {displayedBrand.supportingText || brand.supportingText}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="#gallery"
            className="px-8 py-3.5 bg-cyan-glow text-ink hover:bg-ivory hover:text-ink transition-all duration-300 rounded font-semibold tracking-wide w-full sm:w-auto shadow-lg shadow-cyan-glow/20"
          >
            Explore My Work
          </Link>
          <Link
            href="#contact"
            className="px-8 py-3.5 border border-stone/50 text-ivory hover:border-cyan-glow hover:text-cyan-glow transition-all duration-300 rounded font-semibold tracking-wide w-full sm:w-auto backdrop-blur-sm"
          >
            Book a Shoot
          </Link>
        </motion.div>
      </div>

      {/* Glassmorphism Previous / Next Controls (Shown if > 1 slide) */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-black/30 hover:bg-black/70 border border-white/15 hover:border-cyan-glow/60 text-ivory hover:text-cyan-glow backdrop-blur-md transition-all shadow-xl hover:scale-110 cursor-pointer group"
            aria-label="Previous Slide"
            title="Previous Photo"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-black/30 hover:bg-black/70 border border-white/15 hover:border-cyan-glow/60 text-ivory hover:text-cyan-glow backdrop-blur-md transition-all shadow-xl hover:scale-110 cursor-pointer group"
            aria-label="Next Slide"
            title="Next Photo"
          >
            <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Slide Pagination & Progress Line */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-2 rounded-full overflow-hidden transition-all duration-500 cursor-pointer ${
                    idx === currentIndex
                      ? "w-8 bg-cyan-glow shadow-glow"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  {idx === currentIndex && (
                    <motion.div
                      key={`progress-${currentIndex}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 20, ease: "linear" }}
                      className="absolute inset-0 bg-ivory origin-left"
                    />
                  )}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-mono tracking-widest text-stone-dim uppercase">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
