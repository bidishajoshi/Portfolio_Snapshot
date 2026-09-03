"use client";

import { motion } from "framer-motion";
import { socialLinks } from "@/data/site";
import { ArrowUpRight } from "lucide-react";
import FacebookIcon from "@/components/icons/FacebookIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import SafeImage from "@/components/ui/SafeImage";

export default function Social() {
  const photos = [
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <section className="py-24 bg-surface border-t border-border/50">
      <div className="section-container flex flex-col items-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-50px" }}
           transition={{ duration: 0.6 }}
           className="text-center mb-12"
        >
          <h2 className="text-label mb-3">Community</h2>
          <h3 className="heading-section mb-4">Follow the Journey</h3>
          <p className="text-stone">Behind the scenes, field notes, and daily photography updates.</p>
        </motion.div>

        {/* Minimal grid representation of recent posts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mb-12">
          {photos.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="aspect-square relative group overflow-hidden bg-surface-raised rounded-lg border border-border/40 shadow-lg"
            >
              <SafeImage src={src} alt="Recent Story" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-85 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <span className="text-xs font-semibold text-ivory flex items-center gap-1">View Story <ArrowUpRight size={12} /></span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {socialLinks.map((link) => (
            <a 
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-ivory hover:text-cyan-glow bg-surface-raised hover:bg-surface border border-border hover:border-cyan-glow/40 transition-all duration-300 font-semibold px-6 py-3.5 rounded-full text-sm shadow-md hover:shadow-cyan-glow/10"
            >
              {link.platform.toLowerCase() === "instagram" ? <InstagramIcon size={18} className="text-cyan-glow" /> : <FacebookIcon size={18} className="text-cyan-glow" />}
              <span>Follow on {link.platform}</span>
              <ArrowUpRight size={16} className="opacity-60" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
