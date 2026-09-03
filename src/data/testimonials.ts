// ─── DR DSLR — Testimonials ──────────────────────────────────────────
// Client testimonials. Replace with real reviews as they come in.

export interface TestimonialData {
  id: number;
  name: string;
  eventType: string;
  review: string;
  avatar: string;       // path to avatar image, or empty for initials
}

export const testimonials: TestimonialData[] = [
  {
    id: 1,
    name: "Anisha & Rajan Maharjan",
    eventType: "Wedding Photography",
    review:
      "Himal has an incredible ability to capture genuine emotions. Every photograph felt natural and timeless. Looking through our album still gives us goosebumps — he didn't just take pictures, he preserved feelings.",
    avatar: "",
  },
  {
    id: 2,
    name: "Suman Thapa",
    eventType: "Portrait Session",
    review:
      "I've never felt so comfortable in front of a camera. Himal's calm, patient approach brought out expressions I didn't know I had. The final images were absolutely stunning — editorial quality with real warmth.",
    avatar: "",
  },
  {
    id: 3,
    name: "Priya Shrestha",
    eventType: "Event Photography",
    review:
      "We hired Himal for our company's annual gala and he exceeded every expectation. He moved through the event almost invisibly, yet somehow captured every key moment. A true professional.",
    avatar: "",
  },
  {
    id: 4,
    name: "Bikash Gurung",
    eventType: "Travel & Lifestyle",
    review:
      "Himal joined our trekking expedition as the official photographer. His eye for composition and light is remarkable — the images he delivered were gallery-worthy, not just travel snapshots.",
    avatar: "",
  },
  {
    id: 5,
    name: "Meera & Anil Poudel",
    eventType: "Wedding Photography",
    review:
      "From the initial consultation to the final delivery, everything was seamless. Himal understood our vision perfectly and gave us a collection of photographs that tell our love story beautifully.",
    avatar: "",
  },
];
