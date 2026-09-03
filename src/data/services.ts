// ─── DR DSLR — Services ──────────────────────────────────────────────
// Photography services offered. Icon names reference Lucide React icons.
// No fake prices — each service links to the contact/enquiry section.

export interface ServiceData {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;       // Lucide icon name
}

export const services: ServiceData[] = [
  {
    id: 1,
    title: "Wedding Photography",
    slug: "wedding-photography",
    description:
      "Complete wedding documentation — from intimate ceremonies to grand celebrations. I capture the emotions, details and spontaneous moments that define your day.",
    icon: "heart",
  },
  {
    id: 2,
    title: "Portrait Photography",
    slug: "portrait-photography",
    description:
      "Personal, editorial and professional portraits that reveal character and emotion. Studio and outdoor sessions available.",
    icon: "user",
  },
  {
    id: 3,
    title: "Event Photography",
    slug: "event-photography",
    description:
      "Corporate events, festivals, private gatherings and cultural celebrations — documented with energy and storytelling instinct.",
    icon: "calendar",
  },
  {
    id: 4,
    title: "Travel Photography",
    slug: "travel-photography",
    description:
      "Commissioned travel stories, destination campaigns, and visual diaries that transport viewers to another place.",
    icon: "map-pin",
  },
  {
    id: 5,
    title: "Fashion Photography",
    slug: "fashion-photography",
    description:
      "Editorial and lookbook photography with bold creative direction, professional lighting, and cinematic post-production.",
    icon: "sparkles",
  },
  {
    id: 6,
    title: "Commercial Photography",
    slug: "commercial-photography",
    description:
      "Brand campaigns, advertising, architecture and corporate visual assets — crafted to elevate your brand identity.",
    icon: "briefcase",
  },
  {
    id: 7,
    title: "Product Photography",
    slug: "product-photography",
    description:
      "Clean, compelling product imagery for e-commerce, catalogues and marketing — highlighting texture, form and detail.",
    icon: "box",
  },
  {
    id: 8,
    title: "Photo Sessions",
    slug: "photo-sessions",
    description:
      "Couple sessions, family shoots, maternity photography and creative personal projects — relaxed, natural and beautifully captured.",
    icon: "camera",
  },
];
