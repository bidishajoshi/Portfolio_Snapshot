"use client";

import { useState } from "react";
import { Aperture } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DslrCameraControl() {
  const [shutterFlashing, setShutterFlashing] = useState(false);
  const [colorMode, setColorMode] = useState<"cyan" | "gold">("cyan");
  const [focalLength, setFocalLength] = useState("50mm f/1.2 L");

  const triggerShutter = () => {
    setShutterFlashing(true);
    setTimeout(() => setShutterFlashing(false), 220);

    const nextMode = colorMode === "cyan" ? "gold" : "cyan";
    setColorMode(nextMode);

    if (typeof document !== "undefined") {
      if (nextMode === "gold") {
        document.documentElement.style.setProperty("--color-cyan-glow", "#d4af37");
        document.documentElement.style.setProperty("--color-gold", "#d4af37");
        setFocalLength("85mm f/1.4 Cine");
      } else {
        document.documentElement.style.setProperty("--color-cyan-glow", "#38bdf8");
        document.documentElement.style.setProperty("--color-gold", "#38bdf8");
        setFocalLength("50mm f/1.2 L");
      }
    }
  };

  return (
    <>
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

      <button
        type="button"
        onClick={triggerShutter}
        className="relative group flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/90 border border-border hover:border-cyan-glow/60 transition-all duration-300 shadow-sm cursor-pointer"
        title="Click shutter to trigger camera flash and toggle lens profile"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-glow opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-glow" />
        </span>
        <Aperture size={14} className="text-cyan-glow group-hover:rotate-90 transition-transform duration-500" />
        <span className="text-[11px] font-mono tracking-wider text-ivory/90 group-hover:text-cyan-glow transition-colors">
          {focalLength}
        </span>
      </button>
    </>
  );
}

