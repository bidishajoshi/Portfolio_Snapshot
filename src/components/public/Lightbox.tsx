"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";

interface LightboxProps {
  images: { src: string; title?: string; caption?: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const current = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lightbox-overlay"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          {/* Previous */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              aria-label="Previous image"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImage
              src={current.src}
              alt={current.title || `Image ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded"
              draggable={false}
              variant="large"
            />
            {(current.title || current.caption) && (
              <div className="mt-4 text-center max-w-lg">
                {current.title && (
                  <p className="text-ivory text-sm font-medium">
                    {current.title}
                  </p>
                )}
                {current.caption && (
                  <p className="text-stone text-xs mt-1">{current.caption}</p>
                )}
              </div>
            )}
            {/* Counter */}
            <p className="mt-3 text-stone-dim text-xs">
              {currentIndex + 1} / {images.length}
            </p>
          </motion.div>

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              aria-label="Next image"
            >
              <ChevronRight size={36} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
