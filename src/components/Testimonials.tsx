"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Quote,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { submitPublicReview } from "@/lib/actions/testimonials";

export default function Testimonials({
  testimonials: liveTestimonials,
  title,
  subtitle,
  description,
}: {
  testimonials?: Array<{
    id: string;
    client_name: string;
    review: string;
    rating?: number | null;
    event_type?: string | null;
    avatar?: string | null;
  }>;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
}) {
  const displayedTestimonials = (liveTestimonials ?? []).map((item) => ({
    name: item.client_name,
    review: item.review,
    rating: item.rating ?? 5,
    eventType: item.event_type ?? "Client",
    avatar: item.avatar && item.avatar.trim() !== "" ? item.avatar : null,
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRating, setFormRating] = useState<number>(5);
  const [formReview, setFormReview] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const next = () => setCurrentIndex((prev) => (prev + 1) % displayedTestimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + displayedTestimonials.length) % displayedTestimonials.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await submitPublicReview({
        name: formName,
        email: formEmail || `${formName.toLowerCase().replace(/\s+/g, ".")}@client.review`,
        rating: formRating,
        review: formReview,
        honeypot,
      });

      setSuccessMsg("Thank you! Your review has been submitted for admin approval.");
      setFormName("");
      setFormEmail("");
      setFormReview("");
      setFormRating(5);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding bg-ink relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-surface-raised rounded-full blur-[120px] opacity-40 pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.6 }}
           className="text-center mb-16"
        >
          <h2 className="text-label mb-4">{subtitle || "Words"}</h2>
          <h3 className="heading-section mb-4">{title || "Client Stories & Reviews"}</h3>
          {description && <p className="text-stone text-sm max-w-md mx-auto mb-4">{description}</p>}
          <div className="gold-line mx-auto" />
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto relative px-6 sm:px-16 md:px-24 mb-16">
          <Quote size={56} className="text-gold/15 absolute -top-8 left-2 sm:left-8 rotate-180" />
          
          {displayedTestimonials.length === 0 ? (
            <div className="min-h-[180px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-2xl bg-surface/30">
              <Quote size={28} className="text-stone-dim mb-3" />
              <p className="text-stone text-sm">No client reviews published yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="min-h-[240px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center flex flex-col items-center max-w-2xl mx-auto"
                >
                  {/* Star Rating */}
                  <div className="flex items-center gap-1.5 mb-5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= (displayedTestimonials[currentIndex].rating ?? 5)
                            ? "text-amber-400 fill-amber-400"
                            : "text-stone-dim/30"
                        }
                      />
                    ))}
                  </div>

                  <p className="font-display italic text-xl sm:text-2xl md:text-3xl text-ivory leading-relaxed mb-8">
                    &quot;{displayedTestimonials[currentIndex].review}&quot;
                  </p>

                  <div className="flex flex-col items-center">
                     <div className="w-11 h-11 rounded-full bg-surface-raised mb-2.5 flex items-center justify-center overflow-hidden border border-border/70 shadow-inner">
                        {displayedTestimonials[currentIndex].avatar ? (
                          <img src={displayedTestimonials[currentIndex].avatar} alt={displayedTestimonials[currentIndex].name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gold font-display text-base font-semibold">{displayedTestimonials[currentIndex].name.charAt(0)}</span>
                        )}
                     </div>
                     <h5 className="text-ivory font-semibold text-sm tracking-wide">{displayedTestimonials[currentIndex].name}</h5>
                     <p className="text-stone-dim text-[11px] uppercase tracking-widest mt-0.5">{displayedTestimonials[currentIndex].eventType}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {displayedTestimonials.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone hover:text-gold transition-colors p-2 cursor-pointer" aria-label="Previous testimonial">
                 <ChevronLeft size={28} />
              </button>
              <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 text-stone hover:text-gold transition-colors p-2 cursor-pointer" aria-label="Next testimonial">
                 <ChevronRight size={28} />
              </button>

              <div className="flex justify-center gap-1.5 mt-8 w-full">
                {displayedTestimonials.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? 'bg-gold w-5' : 'bg-border/60 hover:bg-stone w-1.5'}`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Small, Cute, Aesthetic "Leave a Review" Compact Trigger Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="p-6 rounded-2xl border border-amber-500/20 bg-surface/40 backdrop-blur-md shadow-xl flex flex-col items-center gap-3 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-gold/10 rounded-full blur-xl group-hover:bg-gold/20 transition-all pointer-events-none" />
            
            <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Sparkles size={18} />
            </div>

            <div>
              <h4 className="font-display text-lg text-ivory">Worked with DR DSLR?</h4>
              <p className="text-stone text-xs mt-1 max-w-xs mx-auto">
                Share a few words about your photography experience.
              </p>
            </div>

            <button
              onClick={() => {
                setIsModalOpen(true);
                setSuccessMsg(null);
                setErrorMsg(null);
              }}
              className="mt-1 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-ink font-semibold text-xs uppercase tracking-wider rounded-full shadow-md shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              <Star size={14} className="fill-ink" />
              <span>Leave a Review</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Cute, Compact Modal for Review Submission */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl border border-border/80 bg-ink p-6 sm:p-7 shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-stone hover:text-ivory transition-colors p-1.5 rounded-full hover:bg-surface cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1 text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-amber-400" />
                  ))}
                </div>
                <h3 className="font-display text-2xl text-ivory">Share Review</h3>
                <p className="text-stone text-xs mt-1">Your review will be sent for admin approval.</p>
              </div>

              {successMsg ? (
                <div className="py-6 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-emerald-300 text-sm font-medium max-w-xs">{successMsg}</p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="mt-4 px-6 py-2 bg-surface text-ivory text-xs font-semibold uppercase tracking-wider rounded-full border border-border hover:bg-surface-raised transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Honeypot field */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Interactive Star Rating */}
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <span className="text-[11px] uppercase tracking-wider text-stone font-semibold">Rating ⭐</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="p-1 transition-transform hover:scale-125 cursor-pointer"
                        >
                          <Star
                            size={22}
                            className={
                              star <= formRating
                                ? "text-amber-400 fill-amber-400"
                                : "text-stone-dim/30"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1 font-semibold">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ivory placeholder:text-stone-dim focus:border-amber-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1 font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ivory placeholder:text-stone-dim focus:border-amber-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1 font-semibold">
                      Short Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share a few words about your shoot..."
                      value={formReview}
                      onChange={(e) => setFormReview(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ivory placeholder:text-stone-dim focus:border-amber-400 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-ink font-semibold rounded-lg text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-sans"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Review...</span>
                      </>
                    ) : (
                      <>
                        <Star size={14} className="fill-ink" />
                        <span>Share Review</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
