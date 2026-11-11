"use client";

import { useState, useRef, useEffect } from "react";
import { Aperture, Camera, Film, Sparkles, X, Sliders, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Synthesizes a crisp, authentic mechanical camera shutter click
 * using the Web Audio API — zero external audio assets required.
 */
function playShutterSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 1. Mirror flip-up acoustic pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);

    // 2. Mechanical focal-plane shutter curtain transit noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.055);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2400;
    filter.Q.value = 1.6;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.22, ctx.currentTime + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.055);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(ctx.currentTime + 0.01);
  } catch {
    // Non-fatal if audio context is blocked
  }
}

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

  // Close on Escape key
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
    // 1. Play tactile mechanical click
    playShutterSound();

    // 2. Trigger optical flash animation
    setShutterFlashing(true);
    setTimeout(() => setShutterFlashing(false), 240);

    // 3. Switch studio tone preset
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

  const currentLensLabel = activePreset === "amber" ? "50mm f/1.2 L" : "85mm f/1.4 Cine";
  const currentCompactLabel = activePreset === "amber" ? "f/1.2" : "f/1.4";

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Full-screen optical lens shutter flash overlay */}
      <AnimatePresence>
        {shutterFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-[1000] pointer-events-none bg-white flex items-center justify-center overflow-hidden"
          >
            {/* Center optical aperture blades simulation */}
            <motion.div
              initial={{ scale: 0.6, rotate: 0, opacity: 0.8 }}
              animate={{ scale: 1.4, rotate: 45, opacity: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="w-56 h-56 rounded-full border-8 border-black/25 flex items-center justify-center"
            >
              <div className="w-32 h-32 rounded-full border-4 border-black/20" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Pill Button — Responsive & un-congested */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-surface/90 border border-border/80 hover:border-yellow/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow transition-all duration-300 shadow-sm cursor-pointer select-none"
        title="View Camera & Lens Information"
        aria-expanded={isOpen}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow" />
        </span>
        <Aperture size={14} className="text-yellow shrink-0 group-hover:rotate-90 transition-transform duration-500" />
        
        {/* Full label on screens >= 640px, clean compact badge on mobile */}
        <span className="hidden sm:inline text-[11px] font-mono tracking-wider text-ivory/90 group-hover:text-yellow transition-colors whitespace-nowrap">
          {currentLensLabel}
        </span>
        <span className="inline sm:hidden text-[11px] font-mono font-bold tracking-tight text-ivory/90 group-hover:text-yellow transition-colors whitespace-nowrap">
          {currentCompactLabel}
        </span>
      </button>

      {/* Camera & Gear Popover Panel — Always fully visible & neatly bounded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2.5 w-[calc(100vw-1.5rem)] max-w-sm sm:w-[380px] rounded-2xl bg-surface/95 border border-border/90 shadow-2xl backdrop-blur-2xl z-50 text-left text-ivory max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2 min-w-0">
                <Camera size={16} className="text-yellow shrink-0" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-yellow truncate">
                  DR DSLR • Gear & Optics
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone hover:text-ivory transition-colors p-1 rounded-md cursor-pointer shrink-0 ml-2"
                aria-label="Close gear panel"
              >
                <X size={15} />
              </button>
            </div>

            {/* Gear Info Cards */}
            <div className="p-4 sm:p-5 space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-ink/70 border border-blue-500/20">
                <Camera size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-ivory">Primary Camera Bodies</p>
                  <p className="text-stone text-[11px] mt-0.5 leading-relaxed">
                    Full-Frame 35mm Digital & 35mm Cine Sensors with High Dynamic Range
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-ink/70 border border-yellow/20">
                <Aperture size={16} className="text-yellow shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-ivory">Prime Optics & Lenses</p>
                  <p className="text-stone text-[11px] mt-0.5 leading-relaxed">
                    50mm f/1.2 L • 85mm f/1.4 Cine • 24-70mm f/2.8 Pro Glass
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-ink/70 border border-rose-500/20">
                <Film size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-ivory">Signature Style</p>
                  <p className="text-stone text-[11px] mt-0.5 leading-relaxed">
                    Cinematic, narrative editorial portraiture & documentary wedding photography.
                  </p>
                </div>
              </div>
            </div>

            {/* Shutter & Studio Lighting Control Hub — Spacious & Tactile */}
            <div className="bg-ink/70 border-t border-border/70 p-4 sm:p-5 rounded-b-2xl space-y-3">
              {/* Studio Tone Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone font-medium flex items-center gap-1.5">
                  <Sliders size={12} className="text-yellow" />
                  Studio Lighting Grade:
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-surface border border-border/80">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activePreset === "amber" ? "bg-amber-400 shadow-[0_0_6px_#f59e0b]" : "bg-sky-400 shadow-[0_0_6px_#38bdf8]"
                    }`}
                  />
                  <span className="text-ivory">
                    {activePreset === "amber" ? "Amber Tungsten" : "Sapphire Cine"}
                  </span>
                </span>
              </div>

              {/* Shutter Release Button — Tactile, prominent, satisfying */}
              <button
                type="button"
                onClick={triggerShutterFlash}
                className="w-full group relative flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow via-gold to-yellow text-ink font-semibold text-xs tracking-wide shadow-lg shadow-yellow/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer select-none"
              >
                <Aperture size={15} className="group-hover:rotate-45 transition-transform duration-300" />
                <span>Trigger Shutter & Flash</span>
                <Sparkles size={13} className="animate-pulse" />
              </button>

              <div className="flex items-center justify-between text-[10px] text-stone-dim pt-0.5">
                <span className="flex items-center gap-1">
                  <Check size={10} className="text-yellow" /> Optical flash & sound
                </span>
                <span>Switches 3200K / 5600K</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
