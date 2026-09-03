"use client";

import { motion } from "framer-motion";
import { contact } from "@/data/site";
import { Send } from "lucide-react";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // form handling logic here
    alert("Inquiry submitted.");
  };

  return (
    <section id="contact" className="section-padding bg-ink border-t border-border/50">
      <div className="section-container">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.6 }}
           className="text-center mb-16"
        >
          <h2 className="text-label mb-4">Contact</h2>
          <h3 className="heading-section mb-6">Let's Create Something Beautiful</h3>
          <div className="gold-line mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-16 max-w-6xl mx-auto">
          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 flex flex-col justify-center"
          >
             <h4 className="font-display text-3xl text-ivory mb-6 leading-tight">
               Every great photograph begins with a simple conversation.
             </h4>
             <p className="text-stone leading-relaxed mb-10">
               {contact.availability} Please fill out the form, and I will get back to you within 48 hours to discuss your vision.
             </p>
             
             <div className="space-y-6">
                <div>
                  <p className="text-xs text-stone-dim uppercase tracking-widest mb-1">Email</p>
                  <a href={`mailto:${contact.email}`} className="text-ivory font-medium hover:text-gold transition-colors">{contact.email}</a>
                </div>
                <div>
                  <p className="text-xs text-stone-dim uppercase tracking-widest mb-1">Phone</p>
                  <a href={`tel:${contact.phone}`} className="text-ivory font-medium hover:text-gold transition-colors">{contact.phone}</a>
                </div>
                <div>
                  <p className="text-xs text-stone-dim uppercase tracking-widest mb-1">Location</p>
                  <p className="text-ivory font-medium">{contact.location}</p>
                </div>
             </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3 glass-card p-8 md:p-12 rounded-lg"
          >
             <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-2">
                     <label htmlFor="name" className="text-xs text-stone font-semibold uppercase tracking-wider">Name</label>
                     <input type="text" id="name" required className="bg-ink/50 border border-border rounded px-4 py-3 text-ivory focus:border-gold focus:outline-none transition-colors" placeholder="Jane Doe" />
                   </div>
                   <div className="flex flex-col gap-2">
                     <label htmlFor="email" className="text-xs text-stone font-semibold uppercase tracking-wider">Email</label>
                     <input type="email" id="email" required className="bg-ink/50 border border-border rounded px-4 py-3 text-ivory focus:border-gold focus:outline-none transition-colors" placeholder="jane@example.com" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-2">
                     <label htmlFor="type" className="text-xs text-stone font-semibold uppercase tracking-wider">Photography Type</label>
                     <select id="type" required className="bg-ink/50 border border-border rounded px-4 py-3 text-ivory focus:border-gold focus:outline-none transition-colors appearance-none">
                       <option value="">Select an option</option>
                       <option value="wedding">Wedding</option>
                       <option value="portrait">Portrait</option>
                       <option value="event">Event</option>
                       <option value="commercial">Commercial</option>
                       <option value="other">Other</option>
                     </select>
                   </div>
                   <div className="flex flex-col gap-2">
                     <label htmlFor="date" className="text-xs text-stone font-semibold uppercase tracking-wider">Estimated Date</label>
                     <input type="date" id="date" className="bg-ink/50 border border-border rounded px-4 py-3 text-ivory focus:border-gold focus:outline-none transition-colors" />
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs text-stone font-semibold uppercase tracking-wider">Message Details</label>
                  <textarea id="message" required rows={4} className="bg-ink/50 border border-border rounded px-4 py-3 text-ivory focus:border-gold focus:outline-none transition-colors resize-y" placeholder="Tell me about your vision..."></textarea>
                </div>

                <button type="submit" className="mt-4 bg-ivory text-ink hover:bg-gold hover:text-ivory py-4 px-8 rounded font-semibold tracking-wide transition-colors duration-300 flex items-center justify-center gap-2">
                  <Send size={18} />
                  <span>Send Inquiry</span>
                </button>
             </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
