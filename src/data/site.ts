// ─── DR DSLR — Site-wide constants ───────────────────────────────────

export const brand = {
  name: "DR DSLR",
  photographer: "Himal Shrestha",
  tagline: "Capturing Moments Beyond Vision",
  supportingText: "Visual stories crafted through light, emotion and perspective.",
  copyright: `© ${new Date().getFullYear()} DR DSLR. All Rights Reserved.`,
} as const;

export const contact = {
  email: "hello@drdslr.com",
  phone: "+977 9800000000",
  location: "Kathmandu, Nepal",
  availability: "Available for selected projects and collaborations.",
} as const;

export const socialLinks = [
  { platform: "Instagram", url: "https://instagram.com/drdslr", icon: "instagram", enabled: true },
  { platform: "Facebook", url: "https://facebook.com/drdslr", icon: "facebook", enabled: true },
  { platform: "Twitter", url: "https://twitter.com/drdslr", icon: "twitter", enabled: true },
  { platform: "LinkedIn", url: "https://linkedin.com/company/drdslr", icon: "linkedin", enabled: true },
  { platform: "YouTube", url: "https://youtube.com/c/drdslr", icon: "youtube", enabled: true },
  { platform: "GitHub", url: "https://github.com/drdslr", icon: "github", enabled: true },
] as const;

export const aboutContent = {
  title: "Behind the Lens",
  subtitle: "Photographer & Visual Storyteller",
  bio: [
    "Photography, for me, has never been about pressing a shutter button — it's about seeing the world differently. Every frame I compose is a quiet conversation between light, emotion, and the fleeting beauty of a moment that will never repeat itself.",
    "Over the past eight years, I've had the privilege of documenting weddings that moved me to tears, portraits that revealed hidden depths, and landscapes that reminded me why I fell in love with this craft. My work is rooted in authenticity — I don't stage moments, I wait for them.",
    "From the misty peaks of the Himalayas to intimate ceremonies in Kathmandu, my lens has traveled through stories that deserve to be told with honesty and artistry. I believe great photography is invisible — you don't see the technique, you feel the emotion.",
  ],
  portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
} as const;

export const stats = [
  { value: 8, suffix: "+", label: "Years Experience" },
  { value: 250, suffix: "+", label: "Stories Captured" },
  { value: 120, suffix: "+", label: "Happy Clients" },
  { value: 500, suffix: "+", label: "Sessions" },
] as const;

export const processSteps = [
  {
    number: "01",
    title: "Let's Talk",
    description:
      "Every great story starts with a conversation. We'll discuss your vision, the moments that matter most, and how I can bring them to life.",
  },
  {
    number: "02",
    title: "Plan the Story",
    description:
      "Together we'll craft a plan — locations, timelines, moods, and all the little details that transform good photography into unforgettable imagery.",
  },
  {
    number: "03",
    title: "Capture the Moment",
    description:
      "This is where the magic happens. I work with natural light, genuine emotion, and an unobtrusive approach to capture moments as they unfold.",
  },
  {
    number: "04",
    title: "Curate & Edit",
    description:
      "Every image is hand-edited with a cinematic, timeless aesthetic. I select only the strongest frames — quality over quantity, always.",
  },
  {
    number: "05",
    title: "Deliver the Memories",
    description:
      "Your final gallery is delivered in a private online collection — beautifully colour-graded, high-resolution, and ready to treasure forever.",
  },
] as const;

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Stories", href: "#stories" },
  { label: "Albums", href: "#albums" },
  { label: "Gallery", href: "#gallery" },
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;
