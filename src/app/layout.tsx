import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://himalstha.info.np"),
  title: {
    default: "DR DSLR — Himal Shrestha | Capturing Moments Beyond Vision",
    template: "%s — DR DSLR",
  },
  description:
    "DR DSLR is the photography studio of Himal Shrestha, based in Nepal. Wedding, portrait, night, and cinematic photography that captures moments beyond vision.",
  keywords: [
    "Photography",
    "Himal Shrestha",
    "DR DSLR",
    "Nepal Photographer",
    "Kathmandu Wedding Photographer",
    "Cinematic Photography",
    "Portrait Photography",
    "Visual Storytelling",
  ],
  authors: [{ name: "Himal Shrestha", url: "https://himalstha.info.np" }],
  creator: "Himal Shrestha",
  publisher: "DR DSLR",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://himalstha.info.np",
    siteName: "DR DSLR — Himal Shrestha",
    title: "DR DSLR — Himal Shrestha | Capturing Moments Beyond Vision",
    description:
      "DR DSLR is the photography studio of Himal Shrestha, based in Nepal. Wedding, portrait, night, and cinematic photography that captures moments beyond vision.",
    images: [
      {
        url: "/images/placeholder/hero.jpg",
        width: 1200,
        height: 630,
        alt: "DR DSLR Photography — Himal Shrestha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DR DSLR — Himal Shrestha | Capturing Moments Beyond Vision",
    description:
      "Cinematic portrait, wedding, and landscape photography crafted through light, emotion and perspective.",
    images: ["/images/placeholder/hero.jpg"],
    creator: "@drdslr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-body-bg text-ivory transition-colors duration-500">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "bg-surface text-ivory border-border",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
