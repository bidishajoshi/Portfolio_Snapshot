// ─── DR DSLR — Stories ───────────────────────────────────────────────

export interface StoryBlock {
  type: "text" | "image" | "quote";
  content: string;
  caption?: string;
}

export interface StoryData {
  id: number;
  title: string;
  slug: string;
  cover: string;
  excerpt: string;
  location: string;
  date: string;
  readTime: string;
  blocks: StoryBlock[];
}

export const stories: StoryData[] = [
  {
    id: 1,
    title: "The Mountains Through My Lens",
    slug: "mountains-through-my-lens",
    cover: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    excerpt: "A dawn-to-dusk journey through the Annapurna range, chasing light across ridgelines and valleys.",
    location: "Annapurna, Nepal",
    date: "March 2025",
    readTime: "5 min read",
    blocks: [
      { type: "text", content: "There's a particular quality of light in the Himalayas that doesn't exist anywhere else. It arrives slowly, painting peaks in shades of rose gold before the sun has even cleared the horizon." },
      { type: "image", content: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", caption: "First light over the Annapurna range" },
      { type: "text", content: "I spent five days trekking above 4,000 metres with nothing but a camera, a tripod, and the quiet company of the mountains. The goal wasn't to capture postcard views — it was to find the moments between the grand vistas." },
      { type: "image", content: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", caption: "Solitude at altitude" },
      { type: "quote", content: "The mountains don't pose for photographs. You have to earn every frame." },
    ],
  },
  {
    id: 2,
    title: "An Evening in Kathmandu",
    slug: "evening-in-kathmandu",
    cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Wandering the ancient streets of the valley as golden-hour light floods through temple spires.",
    location: "Kathmandu, Nepal",
    date: "January 2025",
    readTime: "4 min read",
    blocks: [
      { type: "text", content: "Kathmandu at dusk is a city of contradictions — ancient temples stand shoulder-to-shoulder with neon-lit shops, and the scent of incense mingles with street food smoke." },
      { type: "image", content: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", caption: "The old quarter at dusk" },
      { type: "text", content: "I started in Durbar Square as the prayer bells began their evening chorus. The light was perfect — warm, directional, painting long shadows across centuries-old stone." },
      { type: "image", content: "https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=1200&q=80", caption: "A temple glowing at dusk" },
    ],
  },
  {
    id: 3,
    title: "A Wedding Full of Emotions",
    slug: "wedding-full-of-emotions",
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    excerpt: "The tears, the laughter, the stolen glances — documenting a celebration of love in its purest form.",
    location: "Kathmandu, Nepal",
    date: "November 2024",
    readTime: "6 min read",
    blocks: [
      { type: "text", content: "Every wedding has a moment that breaks you open. For this one, it was the father of the bride — a stoic, quiet man — who couldn't hold back tears when he saw his daughter in her wedding dress for the first time." },
      { type: "image", content: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", caption: "The exchange of vows" },
      { type: "quote", content: "A photograph should make you feel the room — the warmth, the laughter, the love that fills the space between people." },
      { type: "image", content: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80", caption: "The first dance under fairy lights" },
    ],
  },
  {
    id: 4,
    title: "Faces & Stories",
    slug: "faces-and-stories",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    excerpt: "A portrait series exploring identity, emotion and the stories that live behind every face.",
    location: "Nepal",
    date: "2024–2025",
    readTime: "4 min read",
    blocks: [
      { type: "text", content: "I've always believed that the most powerful photographs are the simplest — one person, one expression, one moment of truth. This series is my attempt to honour that idea." },
      { type: "image", content: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80", caption: "Quiet confidence" },
      { type: "image", content: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80", caption: "Golden hour portrait session" },
    ],
  },
  {
    id: 5,
    title: "Chasing the Golden Hour",
    slug: "chasing-golden-hour",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    excerpt: "That fleeting window of warm, directional light that transforms everything it touches.",
    location: "Nagarkot, Nepal",
    date: "February 2025",
    readTime: "3 min read",
    blocks: [
      { type: "text", content: "Golden hour lasts roughly twenty minutes in the Kathmandu Valley. In those twenty minutes, the entire world changes colour. Shadows grow long and warm, skin glows, and even the most ordinary scene becomes something cinematic." },
      { type: "image", content: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80", caption: "The last twenty minutes of light" },
    ],
  },
];
