"use client";

import { motion } from "framer-motion";
import { aboutContent, stats } from "@/data/site";
import SafeImage from "@/components/ui/SafeImage";

export default function About() {
  return (
    <section id="about" className="section-padding bg-surface pt-32 pb-32">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[3/4] w-full max-w-md mx-auto lg:mx-0 img-card card-3d"
          >
            <div className="w-full h-full card-3d-inner relative">
              <div className="absolute inset-4 border border-cyan-glow/30 z-10 translate-x-4 translate-y-4 rounded" />
              <SafeImage
                src={aboutContent.portrait}
                alt="Photographer Portrait"
                className="w-full h-full object-cover relative z-20 shadow-2xl rounded"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-label mb-4">{aboutContent.title}</h2>
            <h3 className="heading-section mb-2">{aboutContent.subtitle}</h3>
            <div className="gold-line mb-8" />
            
            <div className="space-y-6 text-stone text-lg leading-relaxed mb-12">
              {aboutContent.bio.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col p-4 glass-card rounded-lg border border-border/40">
                  <span className="font-display text-4xl text-cyan-glow mb-1">
                    {stat.value < 10 ? `0${stat.value}` : stat.value}{stat.suffix}
                  </span>
                  <span className="text-xs text-stone-dim uppercase tracking-wider font-semibold">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
