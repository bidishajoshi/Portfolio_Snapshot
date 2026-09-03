// ─── DR DSLR — Photography Categories ────────────────────────────────

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  cover: string;
}

export const categories: CategoryData[] = [
  {
    id: 1,
    name: "Wedding",
    slug: "wedding",
    description: "Timeless moments of love, laughter and togetherness captured with cinematic elegance.",
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    name: "Portrait",
    slug: "portrait",
    description: "Authentic portraits that reveal personality, emotion and the beauty of being human.",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    name: "Travel",
    slug: "travel",
    description: "Visual diaries from journeys across mountains, cities and hidden corners of the world.",
    cover: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    name: "Nature",
    slug: "nature",
    description: "The raw beauty of landscapes, wildlife and the quiet poetry of the natural world.",
    cover: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    name: "Events",
    slug: "events",
    description: "The energy, emotion and atmosphere of celebrations, gatherings and milestone occasions.",
    cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 6,
    name: "Lifestyle",
    slug: "lifestyle",
    description: "Everyday moments elevated into art — candid, warm and effortlessly beautiful.",
    cover: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 7,
    name: "Fashion",
    slug: "fashion",
    description: "Bold, editorial imagery where style, light and creative direction converge.",
    cover: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 8,
    name: "Commercial",
    slug: "commercial",
    description: "Professional imagery that elevates brands, products and visual campaigns.",
    cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  },
];
