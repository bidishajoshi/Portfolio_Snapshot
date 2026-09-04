"use client";

import { useState, useRef, useEffect } from "react";
import { Aperture, Camera, Film, Layers, Sparkles, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DslrCameraControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [shutterFlashing, setShutterFlashing] = useState(false);
  const [activePreset, setActivePreset] = useState<"amber" | "sapphire">("amber");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const triggerShutterFlash = () => {
    setShutterFlashing(true);
    setTimeout(() => setShutterFlashing(false), 220);

    const nextPreset = activePreset === "amber" ? "sapphire" : "amber";
    setActivePreset(nextPreset);

    if (typeof document !== "undefined") {
      if (nextPreset === "amber") {
        document.documentElement.style.setProperty("--color-yellow", "#fbbf24");
        document.documentElement.style.setProperty("--color-gold", "#f59e0b");
      } else {
        document.documentElement.style.setProperty("--color-yellow", "#38bdf8");
        document.documentElement.style.setProperty("--color-gold", "#60a5fa");
      }
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Full-screen optical lens shutter flash overlay */}
      <AnimatePresence>
        {shutterFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[1000] pointer-events-none bg-white flex items-center justify-center"
          >
            <div className="w-48 h-48 rounded-full border-8 border-black/30 scale-150 animate-ping opacity-25" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/90 border border-border/80 hover:border-yellow/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow transition-all duration-300 shadow-sm cursor-pointer"
        title="View Camera & Lens Information"
        aria-expanded={isOpen}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow" />
        </span>
        <Aperture size={14} className="text-yellow group-hover:rotate-90 transition-transform duration-500" />
        <span className="text-[11px] font-mono tracking-wider text-ivory/90 group-hover:text-yellow transition-colors">
          {activePreset === "amber" ? "50mm f/1.2 L" : "85mm f/1.4 Cine"}
        </span>
      </button>

      {/* Camera & Gear Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 sm:left-auto sm:right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-surface/95 border border-border/90 p-5 shadow-2xl backdrop-blur-xl z-50 text-left text-ivory"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-yellow" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-yellow">
                  DR DSLR • Gear & Optics
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone hover:text-ivory transition-colors p-1 rounded-md cursor-pointer"
                aria-label="Close gear panel"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-ink/70 border border-blue-500/20">
                <Camera size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ivory">Primary Camera Bodies</p>
                  <p className="text-stone text-[11px] mt-0.5 leading-relaxed">
                    Full-Frame 35mm Digital & 35mm Cine Sensors with High Dynamic Range
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-ink/70 border border-yellow/20">
                <Aperture size={16} className="text-yellow shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ivory">Prime Optics & Lenses</p>
                  <p className="text-stone text-[11px] mt-0.5 leading-relaxed">
                    50mm f/1.2 L • 85mm f/1.4 Cine • 24-70mm f/2.8 Pro Ultra-Sharp Glass
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-ink/70 border border-rose-500/20">
                <Film size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ivory">Signature Style</p>
                  <p className="text-stone text-[11px] mt-0.5 leading-relaxed">
                    Cinematic, narrative-driven editorial portraiture & documentary wedding photography.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between">
              <span className="text-[11px] text-stone font-mono">
                Lighting: <strong className="text-ivory">{activePreset === "amber" ? "Amber Tungsten" : "Sapphire Cine"}</strong>
              </span>
              <button
                type="button"
                onClick={triggerShutterFlash}
                className="px-3 py-1.5 rounded-lg bg-yellow/15 hover:bg-yellow/25 text-yellow border border-yellow/30 text-[11px] font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles size={12} />
                <span>Trigger Shutter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


