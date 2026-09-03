// ─── DR DSLR — Albums ────────────────────────────────────────────────

export interface AlbumPhoto {
  id: number;
  image: string;
  title: string;
  caption?: string;
}

export interface AlbumData {
  id: number;
  title: string;
  slug: string;
  cover: string;
  location: string;
  date: string;
  description: string;
  photoCount: number;
  photos: AlbumPhoto[];
}

export const albums: AlbumData[] = [
  {
    id: 1,
    title: "Wedding Memories",
    slug: "wedding-memories",
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    location: "Kathmandu, Nepal",
    date: "2025",
    description: "A collection of the most heartfelt wedding moments — the tears, the laughter, and the quiet glances that say everything.",
    photoCount: 6,
    photos: [
      { id: 1, image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", title: "The Vow" },
      { id: 2, image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80", title: "The First Dance" },
      { id: 3, image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80", title: "Bridal Prep" },
      { id: 4, image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80", title: "Together" },
      { id: 5, image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80", title: "Traditional Blessings" },
      { id: 6, image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80", title: "Celebration" },
    ],
  },
  {
    id: 2,
    title: "Kathmandu Stories",
    slug: "kathmandu-stories",
    cover: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    location: "Kathmandu, Nepal",
    date: "2024–2025",
    description: "Streets, temples, markets and faces from across the ancient valley — stories discovered while wandering with a camera.",
    photoCount: 5,
    photos: [
      { id: 1, image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", title: "Streets of Bhaktapur" },
      { id: 2, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", title: "Temple at Dusk" },
      { id: 3, image: "https://images.unsplash.com/photo-1518005068251-37900150df60?auto=format&fit=crop&w=1200&q=80", title: "Boudhanath Prayer Flags" },
      { id: 4, image: "https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=1200&q=80", title: "Night Market" },
    ],
  },
  {
    id: 3,
    title: "Mountain & Travel",
    slug: "mountain-travel",
    cover: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    location: "Nepal",
    date: "2024–2025",
    description: "Expeditions through the Annapurna and Everest regions — capturing the majesty of high altitudes.",
    photoCount: 5,
    photos: [
      { id: 1, image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", title: "Annapurna Peak" },
      { id: 2, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", title: "Golden Ridge" },
      { id: 3, image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80", title: "High Altitude Solitude" },
      { id: 4, image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80", title: "Rhododendron Valley" },
    ],
  },
  {
    id: 4,
    title: "Portrait Sessions",
    slug: "portrait-sessions",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    location: "Kathmandu, Nepal",
    date: "2025",
    description: "Faces that tell stories — editorial and candid portraits that celebrate individuality and authentic expression.",
    photoCount: 4,
    photos: [
      { id: 1, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80", title: "Quiet Solitude" },
      { id: 2, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80", title: "Golden Hour Glow" },
      { id: 3, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80", title: "Urban Portrait" },
      { id: 4, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80", title: "Black & White Expression" },
    ],
  },
  {
    id: 5,
    title: "Nature & Landscapes",
    slug: "nature-landscapes",
    cover: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    location: "Nepal",
    date: "2024–2025",
    description: "The Himalayas, forests, valleys and waterways — the raw, untamed beauty of the natural world.",
    photoCount: 4,
    photos: [
      { id: 1, image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80", title: "Mountain Bloom" },
      { id: 2, image: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1200&q=80", title: "Phewa Lake Mist" },
      { id: 3, image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80", title: "Forest Canopy" },
    ],
  },
  {
    id: 6,
    title: "Events & Celebrations",
    slug: "events-celebrations",
    cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    location: "Nepal",
    date: "2024–2025",
    description: "Celebrations, festivals and milestone occasions — the energy of people coming together.",
    photoCount: 4,
    photos: [
      { id: 1, image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80", title: "Festival of Colors" },
      { id: 2, image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80", title: "Gala Night" },
      { id: 3, image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=1200&q=80", title: "Midnight Fireworks" },
    ],
  },
];
