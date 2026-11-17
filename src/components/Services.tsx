"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { ComponentType } from "react";
import { services as fallbackServices } from "@/data/services";

function getServiceIconName(title: string, icon?: string | null): string {
  if (icon && icon.trim() !== "" && icon !== "camera") {
    return icon
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }
  const t = title.toLowerCase();
  if (t.includes("wedding") || t.includes("couple") || t.includes("matrimon")) return "Heart";
  if (t.includes("portrait") || t.includes("model") || t.includes("individual")) return "User";
  if (t.includes("event") || t.includes("ceremony") || t.includes("gathering")) return "Calendar";
  if (t.includes("travel") || t.includes("destination") || t.includes("landscape")) return "MapPin";
  if (t.includes("film") || t.includes("cinema") || t.includes("video")) return "Film";
  if (t.includes("fashion") || t.includes("editorial")) return "Sparkles";
  if (t.includes("commercial") || t.includes("brand")) return "Briefcase";
  return "Camera";
}

export default function Services({
  services: liveServices,
  title,
  subtitle,
  description,
}: {
  services?: Array<{ id: string; title: string; description: string | null; icon?: string | null }>;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
}) {
  const sourceServices =
    liveServices && liveServices.length > 0
      ? liveServices
      : fallbackServices.map((s) => ({
          id: String(s.id),
          title: s.title,
          description: s.description,
          icon: s.icon,
        }));

  const displayedServices = sourceServices.map((service) => ({
    ...service,
    iconName: getServiceIconName(service.title, service.icon),
  }));

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
            const Icon =
              (LucideIcons as unknown as Record<string, ComponentType<{ size?: number; strokeWidth?: number }>>)[
                service.iconName
              ] || LucideIcons.Camera;

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

                <a
                  href="#contact"
                  aria-label={`Enquire about ${service.title}`}
                  className="text-xs font-semibold text-ivory uppercase tracking-widest hover:text-gold transition-colors inline-block relative border-b border-transparent hover:border-gold pb-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                >
                  Enquire Now
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
