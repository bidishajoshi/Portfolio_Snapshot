"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/data/testimonials";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

export default function Testimonials({ testimonials: liveTestimonials }: { testimonials?: Array<{ id: string; client_name: string; review: string; event_type: string | null }> }) {
  const displayedTestimonials = liveTestimonials?.length
    ? liveTestimonials.map((item) => ({ name: item.client_name, review: item.review, eventType: item.event_type ?? "Client", avatar: null }))
    : testimonials;
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % displayedTestimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + displayedTestimonials.length) % displayedTestimonials.length);

  return (
    <section className="section-padding bg-ink relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-surface-raised rounded-full blur-[120px] opacity-50 pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.6 }}
           className="text-center mb-16"
        >
          <h2 className="text-label mb-4">Words</h2>
          <h3 className="heading-section mb-6">Client Stories</h3>
          <div className="gold-line mx-auto" />
        </motion.div>

        <div className="max-w-4xl mx-auto relative px-12 md:px-24">
          <Quote size={64} className="text-gold/20 absolute -top-10 left-4 md:left-12 rotate-180" />
          
          <div className="min-h-[250px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="font-display italic text-2xl md:text-3xl lg:text-4xl text-ivory leading-relaxed mb-10">
                  &quot;{displayedTestimonials[currentIndex].review}&quot;
                </p>
                <div className="flex flex-col items-center">
                   <div className="w-12 h-12 rounded-full bg-surface-raised mb-4 flex items-center justify-center overflow-hidden border border-border">
                      {displayedTestimonials[currentIndex].avatar ? (
                        <img src={displayedTestimonials[currentIndex].avatar} alt={displayedTestimonials[currentIndex].name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gold font-display text-lg">{displayedTestimonials[currentIndex].name.charAt(0)}</span>
                      )}
                   </div>
                   <h5 className="text-ivory font-semibold text-sm tracking-wide">{displayedTestimonials[currentIndex].name}</h5>
                   <p className="text-stone-dim text-xs uppercase tracking-widest mt-1">{displayedTestimonials[currentIndex].eventType}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone hover:text-gold transition-colors p-2" aria-label="Previous testimonial">
             <ChevronLeft size={32} />
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 text-stone hover:text-gold transition-colors p-2" aria-label="Next testimonial">
             <ChevronRight size={32} />
          </button>

          <div className="flex justify-center gap-2 mt-12 w-full">
            {displayedTestimonials.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-gold w-6' : 'bg-border hover:bg-stone'}`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
