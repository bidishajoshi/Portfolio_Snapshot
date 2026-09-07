"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRating, setFormRating] = useState<number>(5);
  const [formEventType, setFormEventType] = useState("");
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
        email: formEmail,
        rating: formRating,
        review: formReview,
        eventType: formEventType,
        honeypot,
      });

      setSuccessMsg(res.message);
      setFormName("");
      setFormEmail("");
      setFormEventType("");
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
          <h2 className="text-label mb-4">{subtitle || "Words"}</h2>
          <h3 className="heading-section mb-6">{title || "Client Stories & Reviews"}</h3>
          {description && <p className="text-stone text-sm max-w-md mx-auto mb-4">{description}</p>}
          <div className="gold-line mx-auto" />
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto relative px-12 md:px-24 mb-24">
          <Quote size={64} className="text-gold/20 absolute -top-10 left-4 md:left-12 rotate-180" />
          
          {displayedTestimonials.length === 0 ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-2xl bg-surface/30">
              <Quote size={32} className="text-stone-dim mb-3" />
              <p className="text-stone text-sm">No client reviews published yet. Be the first to share your experience below!</p>
            </div>
          ) : (
            <div className="min-h-[250px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center flex flex-col items-center"
                >
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={
                          star <= (displayedTestimonials[currentIndex].rating ?? 5)
                            ? "text-amber-400 fill-amber-400"
                            : "text-stone-dim/40"
                        }
                      />
                    ))}
                  </div>

                  <p className="font-display italic text-2xl md:text-3xl lg:text-4xl text-ivory leading-relaxed mb-8">
                    &quot;{displayedTestimonials[currentIndex].review}&quot;
                  </p>
                  <div className="flex flex-col items-center">
                     <div className="w-12 h-12 rounded-full bg-surface-raised mb-3 flex items-center justify-center overflow-hidden border border-border">
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
          )}

          {displayedTestimonials.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone hover:text-gold transition-colors p-2 cursor-pointer" aria-label="Previous testimonial">
                 <ChevronLeft size={32} />
              </button>
              <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 text-stone hover:text-gold transition-colors p-2 cursor-pointer" aria-label="Next testimonial">
                 <ChevronRight size={32} />
              </button>

              <div className="flex justify-center gap-2 mt-10 w-full">
                {displayedTestimonials.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? 'bg-gold w-6' : 'bg-border hover:bg-stone w-2'}`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Public Client Review Submission Form */}
        <div className="max-w-2xl mx-auto rounded-2xl border border-border/80 bg-surface/50 backdrop-blur-md p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h4 className="font-display text-2xl text-ivory mb-2">Leave a Review</h4>
            <p className="text-stone text-xs md:text-sm">
              Worked with DR DSLR? Share your experience below. All submissions are moderated before publishing.
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Honeypot anti-spam field */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Star Rating Picker */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-stone font-semibold">Your Rating</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    className="p-1 text-stone-dim hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Star
                      size={24}
                      className={
                        star <= formRating
                          ? "text-amber-400 fill-amber-400 scale-110"
                          : "text-stone-dim/40"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-2 font-semibold">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-ink/70 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-2 font-semibold">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-ink/70 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone mb-2 font-semibold">
                Event / Service Type (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Wedding Photography, Portrait Shoot"
                value={formEventType}
                onChange={(e) => setFormEventType(e.target.value)}
                className="w-full rounded-lg border border-border bg-ink/70 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone mb-2 font-semibold">
                Your Review / Feedback *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Share your experience working with DR DSLR..."
                value={formReview}
                onChange={(e) => setFormReview(e.target.value)}
                className="w-full rounded-lg border border-border bg-ink/70 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-amber-400 focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-ink font-semibold rounded-lg hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
