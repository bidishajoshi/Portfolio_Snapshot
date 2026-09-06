"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { ComponentType } from "react";

export default function Services({
  services: liveServices,
  title,
  subtitle,
  description,
}: {
  services?: Array<{ id: string; title: string; description: string | null }>;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
}) {
  const displayedServices = (liveServices ?? []).map((service) => ({ ...service, icon: "camera" }));
  return (
    <section id="services" className="section-padding bg-ink border-t border-border/50">
      <div className="section-container">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.6 }}
           className="text-center mb-16"
        >
          <h2 className="text-label mb-4">{subtitle || "Expertise"}</h2>
          <h3 className="heading-section mb-6">{title || "Services"}</h3>
          {description && <p className="text-stone text-sm max-w-md mx-auto mb-4">{description}</p>}
          <div className="gold-line mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 hover:gap-6">
          {displayedServices.map((service, idx) => {
             const iconName = service.icon.split("-").map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
             const Icon = (LucideIcons as unknown as Record<string, ComponentType<{ size?: number; strokeWidth?: number }>>)[iconName] || LucideIcons.Camera;

             return (
               <motion.div
                 key={service.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 0.5, delay: idx * 0.1 }}
                 className="glass-card p-8 rounded-lg group hover:border-gold/30 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
               >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-colors duration-500" />
                 
                 <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-gold mb-6 group-hover:scale-110 group-hover:border-gold/50 transition-all duration-300">
                   <Icon size={20} strokeWidth={1.5} />
                 </div>
                 
                 <h4 className="font-display text-xl text-ivory mb-3">{service.title}</h4>
                 <p className="text-sm text-stone leading-relaxed mb-6">
                   {service.description}
                 </p>
                 
                 <a href="#contact" className="text-xs font-semibold text-ivory uppercase tracking-widest hover:text-gold transition-colors inline-block relative border-b border-transparent hover:border-gold pb-0.5">
                   Enquire Now
                 </a>
               </motion.div>
             )
          })}
        </div>
      </div>
    </section>
  );
}
