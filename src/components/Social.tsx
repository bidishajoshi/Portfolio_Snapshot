"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SocialIcon from "@/components/icons/SocialIcon";
import SafeImage from "@/components/ui/SafeImage";

function getSocialUrl(platform: string, url: string): string {
  const p = platform.toLowerCase().trim();
  if (p === "whatsapp") {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const cleanNumber = url.replace(/[^0-9]/g, "");
    return cleanNumber ? `https://wa.me/${cleanNumber}` : "https://wa.me/";
  }
  return url;
}

export default function Social({ socialLinks: liveLinks, photos = [] }: { socialLinks?: Array<{ platform: string; label: string | null; url: string; enabled: boolean }>; photos?: Array<{ id: string; publicId: string; title: string }> }) {
  const displayedLinks = (liveLinks ?? []).filter((link) => link.enabled);

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
          {photos.map((photo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="aspect-square relative group overflow-hidden bg-surface-raised rounded-lg border border-border/40 shadow-lg"
            >
              <SafeImage src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_800,c_fill/${photo.publicId}`} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-85 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <span className="text-xs font-semibold text-ivory flex items-center gap-1">View Story <ArrowUpRight size={12} /></span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {displayedLinks.map((link) => (
            <a 
              key={link.platform}
              href={getSocialUrl(link.platform, link.url)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-ivory hover:text-cyan-glow bg-surface-raised hover:bg-surface border border-border hover:border-cyan-glow/40 transition-all duration-300 font-semibold px-6 py-3.5 rounded-full text-sm shadow-md hover:shadow-cyan-glow/10"
            >
              <SocialIcon platform={link.platform} size={18} className="text-cyan-glow" />
              <span>{link.label || `Follow on ${link.platform}`}</span>
              <ArrowUpRight size={16} className="opacity-60" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
