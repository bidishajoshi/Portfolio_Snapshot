"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Aperture } from "lucide-react";
import { brand } from "@/data/site";
import Link from "next/link";
import { cloudinaryImageUrl, cloudinarySrcSet } from "@/lib/cloudinary/url";

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

const DEFAULT_HERO_IMAGE = "/images/placeholder/hero.jpg";

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
      : [DEFAULT_HERO_IMAGE];

  const [[currentIndex, direction], setPage] = useState<[number, number]>([0, 0]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [initialLoaded, setInitialLoaded] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Preload the FIRST slide immediately into the browser engine so it appears instantly
  useEffect(() => {
    if (images.length > 0 && images[0]) {
      const firstSrc = cloudinaryImageUrl(images[0], { width: 1920 });
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = firstSrc;
      const responsiveSrc = cloudinarySrcSet(images[0]);
      if (responsiveSrc) {
        link.imageSrcset = responsiveSrc;
        link.imageSizes = "100vw";
      }
      document.head.appendChild(link);
      return () => {
        try {
          document.head.removeChild(link);
        } catch {}
      };
    }
  }, [images]);

  // Safety fallback: ensure loading skeleton disappears even if image load event is delayed
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setInitialLoaded(true);
    }, 1200);
    return () => clearTimeout(fallbackTimer);
  }, []);

  const paginate = useCallback(
    (newDirection: number) => {
      if (images.length <= 1) return;
      setPage(([prevIndex]) => {
        let nextIndex = prevIndex + newDirection;
        if (nextIndex >= images.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = images.length - 1;
        return [nextIndex, newDirection];
      });
    },
    [images.length]
  );

  const nextSlide = useCallback(() => {
    paginate(1);
  }, [paginate]);

  const prevSlide = useCallback(() => {
    paginate(-1);
  }, [paginate]);

  // Auto-slide every 5000ms (5 seconds). Resets whenever user manually moves or slide changes
  useEffect(() => {
    if (images.length <= 1) return;

    timerRef.current = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, images.length, paginate]);

  // Preload the NEXT slide image + responsive srcSet into browser cache prior to transition
  useEffect(() => {
    if (images.length <= 1) return;
    const nextIdx = (currentIndex + 1) % images.length;
    const nextImgSrc = images[nextIdx];
    if (!nextImgSrc) return;

    const img = new Image();
    const responsiveSrcSet = cloudinarySrcSet(nextImgSrc);
    if (responsiveSrcSet) {
      img.srcset = responsiveSrcSet;
      img.sizes = "100vw";
    }
    img.src = cloudinaryImageUrl(nextImgSrc, { width: 1920 });
  }, [currentIndex, images]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 40) paginate(1);
    if (diff < -40) paginate(-1);
    setTouchStart(null);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0.9,
    }),
  };

  const currentRawSrc = images[currentIndex] || DEFAULT_HERO_IMAGE;
  const currentOptimizedSrc = cloudinaryImageUrl(currentRawSrc, { width: 1920 });
  const currentSrcSet = cloudinarySrcSet(currentRawSrc);

  const goToSlide = useCallback(
    (targetIndex: number) => {
      if (targetIndex === currentIndex || images.length <= 1) return;
      const newDir = targetIndex > currentIndex ? 1 : -1;
      setPage([targetIndex, newDir]);
    },
    [currentIndex, images.length]
  );

  return (
    <section
      id="home"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-ink select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading Skeleton / Placeholder for Initial Image Load */}
      <AnimatePresence>
        {!initialLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 z-15 bg-ink flex items-center justify-center overflow-hidden pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-surface-raised/40 to-ink animate-pulse" />
            <div className="absolute inset-0 bg-radial-at-c from-cyan-glow/10 via-transparent to-transparent opacity-30" />
            <div className="relative z-20 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-cyan-glow/20 border-t-cyan-glow animate-spin flex items-center justify-center">
                <Aperture size={18} className="text-cyan-glow/70" />
              </div>
              <span className="text-[11px] text-stone/60 font-mono tracking-[0.25em] uppercase animate-pulse">
                Loading Hero Slider...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Slider Background - Full Page Edge-to-Edge */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/20 to-ink/90 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-at-c from-cyan-glow/10 via-transparent to-transparent opacity-30 pointer-events-none z-10" />

        {images.length > 0 ? (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.4 },
              }}
              className="absolute inset-0 w-full h-full will-change-transform"
            >
              <img
                src={currentOptimizedSrc || DEFAULT_HERO_IMAGE}
                srcSet={currentSrcSet || undefined}
                sizes={currentSrcSet ? "100vw" : undefined}
                alt="Hero Photography"
                className="w-full h-full object-cover object-center"
                loading={currentIndex === 0 ? "eager" : "lazy"}
                fetchPriority={currentIndex === 0 ? "high" : "auto"}
                onLoad={() => {
                  setInitialLoaded(true);
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.srcset = "";
                  target.src = DEFAULT_HERO_IMAGE;
                  setInitialLoaded(true);
                }}
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
        </>
      )}

      {/* Slide Navigation Dots / Active Pill Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-black/25 backdrop-blur-md border border-white/10 shadow-lg">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "w-8 bg-amber-400 shadow-md shadow-amber-400/30"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
