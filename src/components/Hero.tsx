"use client";

import { motion } from "framer-motion";
import { brand } from "@/data/site";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";

export default function Hero({ brandOverride, backgroundImage }: { brandOverride?: { name: string; photographer: string; tagline: string; supportingText?: string | null }; backgroundImage?: string | null }) {
  const displayedBrand = brandOverride ?? brand;
  return (
    <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink z-10" />
        <div className="absolute inset-0 bg-radial-at-c from-cyan-glow/10 via-transparent to-transparent opacity-40 pointer-events-none z-10" />
        <SafeImage
          src={backgroundImage ?? undefined}
          alt="Hero Photography"
          className="w-full h-full object-cover object-center scale-105 animate-pulse duration-10000"
          style={{ animationDuration: '25s' }}
        />
      </div>

      <div className="relative z-20 text-center flex flex-col items-center px-6 mt-16 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-ivory text-sm tracking-[0.35em] uppercase font-semibold mb-4"
        >
          {displayedBrand.photographer}
        </motion.p>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-ivory via-cyan-glow to-maroon-deep mb-6 leading-tight drop-shadow-lg font-bold"
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
          className="font-display italic text-2xl md:text-3xl text-ivory/95 mb-4"
        >
          &quot;{displayedBrand.tagline}&quot;
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-stone max-w-xl mb-10 text-lg leading-relaxed"
        >
          {displayedBrand.supportingText || brand.supportingText}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="#gallery" className="px-8 py-3.5 bg-cyan-glow text-ink hover:bg-ivory hover:text-ink transition-all duration-300 rounded font-semibold tracking-wide w-full sm:w-auto shadow-lg shadow-cyan-glow/20">
            Explore My Work
          </Link>
          <Link href="#contact" className="px-8 py-3.5 border border-stone/50 text-ivory hover:border-cyan-glow hover:text-cyan-glow transition-all duration-300 rounded font-semibold tracking-wide w-full sm:w-auto backdrop-blur-sm">
            Book a Shoot
          </Link>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-stone-dim uppercase tracking-widest font-mono">Scroll</span>
        <div className="w-[1px] h-12 bg-border relative overflow-hidden">
           <motion.div 
             animate={{ y: [0, 48, 0] }}
             transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
             className="w-full h-1/2 bg-cyan-glow absolute top-0"
           />
        </div>
      </motion.div>
    </section>
  );
}
