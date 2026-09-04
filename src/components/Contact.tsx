"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { contact } from "@/data/site";
import { Send, CheckCircle2, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { createInquiry } from "@/lib/actions/inquiries";
import WhatsappIcon from "@/components/icons/WhatsappIcon";

export default function Contact({
  contactOverride,
}: {
  contactOverride?: { email: string | null; phone: string | null };
}) {
  const displayedContact = { ...contact, ...contactOverride };
  const targetWhatsAppNumber = "9844437665";
  const intlWhatsAppNumber = "9779844437665";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    eventType: "",
    eventDate: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getPrefilledWhatsAppText = (data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) => {
    return (
      `New inquiry received from ${data.name}.\n` +
      `Subject: ${data.subject || "Photography Inquiry"}\n` +
      `Message: ${data.message}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone || "Not provided"}`
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please complete the required fields (Name, Email, Message).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject || (formData.eventType ? `${formData.eventType} Photography Inquiry` : undefined),
        eventType: formData.eventType || undefined,
        eventDate: formData.eventDate || undefined,
        message: formData.message,
      });

      const submitted = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim() || (formData.eventType ? `${formData.eventType} Inquiry` : "Photography Inquiry"),
        message: formData.message.trim(),
      };

      setSubmittedData(submitted);

      // Construct prefilled WhatsApp URL and automatically open in new tab
      const text = getPrefilledWhatsAppText(submitted);
      const waUrl = `https://wa.me/${intlWhatsAppNumber}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      // Reset form fields
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        eventType: "",
        eventDate: "",
        message: "",
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit inquiry. Please try again or message via WhatsApp directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-ink relative border-t border-border/40 overflow-hidden">
      {/* Cinematic ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-glow/5 via-gold/5 to-transparent blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-raised border border-cyan-glow/20 text-cyan-glow text-xs uppercase tracking-widest font-mono mb-4 shadow-sm">
            <Sparkles size={12} className="text-cyan-glow" />
            <span>Get in Touch</span>
          </div>
          <h2 className="heading-section mb-4">Let&apos;s Create Something Cinematic</h2>
          <p className="text-stone max-w-lg mx-auto text-sm md:text-base">
            Have an upcoming wedding, editorial shoot, or portrait session? Reach out below or message us directly on WhatsApp.
          </p>
          <div className="gold-line mx-auto mt-6" />
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
          {/* Info Side (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex flex-col gap-8"
          >
            <div className="glass-card p-8 rounded-2xl border border-border/50 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-glow/40 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-glow/5 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="font-display text-2xl text-ivory mb-3 leading-snug">
                Every frame begins with a story.
              </h3>
              <p className="text-stone text-sm leading-relaxed mb-8">
                {contact.availability} Leave a note with your vision or event timeline, and our team will get back to you promptly.
              </p>

              <div className="space-y-6 pt-4 border-t border-border/40 text-sm">
                <div>
                  <p className="text-[11px] text-stone-dim uppercase tracking-widest font-mono mb-1">Direct WhatsApp</p>
                  <a
                    href={`https://wa.me/${intlWhatsAppNumber}?text=${encodeURIComponent("Hello DR DSLR, I would like to inquire about a photography booking.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    <WhatsappIcon size={18} className="text-emerald-400" />
                    <span>+977 {targetWhatsAppNumber}</span>
                  </a>
                </div>

                <div>
                  <p className="text-[11px] text-stone-dim uppercase tracking-widest font-mono mb-1">Email</p>
                  <a
                    href={`mailto:${displayedContact.email}`}
                    className="text-ivory hover:text-cyan-glow transition-colors font-medium"
                  >
                    {displayedContact.email || contact.email}
                  </a>
                </div>

                <div>
                  <p className="text-[11px] text-stone-dim uppercase tracking-widest font-mono mb-1">Phone</p>
                  <a
                    href={`tel:${displayedContact.phone}`}
                    className="text-ivory hover:text-gold transition-colors font-medium"
                  >
                    {displayedContact.phone || contact.phone}
                  </a>
                </div>

                <div>
                  <p className="text-[11px] text-stone-dim uppercase tracking-widest font-mono mb-1">Studio Location</p>
                  <p className="text-ivory font-medium">{contact.location}</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-surface border border-emerald-500/20 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Fastest Response</p>
                <p className="text-xs text-stone mt-0.5">Chat with Himal directly on WhatsApp</p>
              </div>
              <a
                href={`https://wa.me/${intlWhatsAppNumber}?text=${encodeURIComponent("Hello Himal, I found your portfolio and would like to inquire.")}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-ink font-semibold text-xs transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-500/20"
              >
                <WhatsappIcon size={16} />
                <span>Message Now</span>
              </a>
            </div>
          </motion.div>

          {/* Form Side (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 glass-card p-8 md:p-10 rounded-2xl border border-border/50 relative backdrop-blur-xl"
          >
            {submittedData ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center flex flex-col items-center gap-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="font-display text-2xl text-ivory">Thank You, {submittedData.name}!</h4>
                <p className="text-stone text-sm max-w-md leading-relaxed">
                  Your inquiry has been received and saved to our database. A WhatsApp window was opened to connect with us immediately.
                </p>

                <div className="p-4 rounded-xl bg-surface-raised border border-border/60 text-left w-full max-w-md text-xs text-stone space-y-1.5 mt-2">
                  <p><strong className="text-ivory">Subject:</strong> {submittedData.subject}</p>
                  <p><strong className="text-ivory">Email:</strong> {submittedData.email}</p>
                  {submittedData.phone && <p><strong className="text-ivory">Phone:</strong> {submittedData.phone}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-md">
                  <a
                    href={`https://wa.me/${intlWhatsAppNumber}?text=${encodeURIComponent(getPrefilledWhatsAppText(submittedData))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-ink font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <WhatsappIcon size={16} />
                    <span>Open WhatsApp (9844437665)</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="py-3 px-5 rounded-lg border border-border bg-surface hover:bg-surface-raised text-stone hover:text-ivory text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    Send Another
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-[11px] font-mono uppercase tracking-wider text-stone font-semibold">
                      Your Name <span className="text-cyan-glow">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-ink/60 border border-border rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow outline-none transition-all"
                      placeholder="e.g. Aayush Sharma"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-[11px] font-mono uppercase tracking-wider text-stone font-semibold">
                      Email Address <span className="text-cyan-glow">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-ink/60 border border-border rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow outline-none transition-all"
                      placeholder="e.g. aayush@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-[11px] font-mono uppercase tracking-wider text-stone font-semibold">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-ink/60 border border-border rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow outline-none transition-all"
                      placeholder="e.g. 9844437665"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="subject" className="text-[11px] font-mono uppercase tracking-wider text-stone font-semibold">
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-ink/60 border border-border rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow outline-none transition-all"
                      placeholder="e.g. Wedding shoot enquiry"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="eventType" className="text-[11px] font-mono uppercase tracking-wider text-stone font-semibold">
                      Photography Type
                    </label>
                    <select
                      id="eventType"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="bg-ink/60 border border-border rounded-lg px-4 py-3 text-sm text-ivory focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select a category…</option>
                      <option value="Wedding">Wedding Photography & Film</option>
                      <option value="Portrait">Portrait & Editorial</option>
                      <option value="Commercial">Commercial & Brand</option>
                      <option value="Event">Cultural & Special Event</option>
                      <option value="Cinematic Story">Visual Story / Feature</option>
                      <option value="Other">Other Custom Project</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="eventDate" className="text-[11px] font-mono uppercase tracking-wider text-stone font-semibold">
                      Estimated Event Date
                    </label>
                    <input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="bg-ink/60 border border-border rounded-lg px-4 py-3 text-sm text-ivory focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-[11px] font-mono uppercase tracking-wider text-stone font-semibold">
                    Message Details <span className="text-cyan-glow">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-ink/60 border border-border rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow outline-none transition-all resize-y"
                    placeholder="Tell us about your event, location, timing, or creative vision…"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
                    {errorMessage}
                  </p>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-cyan-glow to-blue-500 hover:from-cyan-glow/90 hover:to-blue-400 text-ink font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-glow/20 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-ink" />
                        <span>Submitting…</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} className="text-ink transition-transform group-hover:translate-x-0.5" />
                        <span>Submit Inquiry & Open WhatsApp</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs text-stone-dim text-center sm:text-left">
                    Direct line: <strong className="text-stone">9844437665</strong>
                  </span>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

