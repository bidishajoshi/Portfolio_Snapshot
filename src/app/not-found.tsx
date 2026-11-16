import Link from "next/link";
import { Aperture, ArrowLeft, Home, Images } from "lucide-react";
import { brand } from "@/data/site";

export const metadata = {
  title: "404 — Page Not Found",
  description: "The page or photo story you are looking for cannot be found.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-6 py-16 text-center">
      <div className="max-w-lg w-full p-8 sm:p-10 rounded-2xl border border-border/80 bg-surface/70 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        {/* Animated Aperture Badge */}
        <div className="w-16 h-16 rounded-full bg-surface-raised border border-gold/40 flex items-center justify-center mb-6 shadow-inner">
          <Aperture size={32} className="text-gold animate-spin-slow" strokeWidth={1.5} />
        </div>

        {/* Status Code & Header */}
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-medium text-ivory tracking-wide mb-3">
          Frame Out of Focus
        </h1>

        <p className="text-sm text-stone leading-relaxed mb-8 max-w-sm">
          The moment, album, or visual story you are searching for might have been relocated, renamed, or is currently out of frame.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-ink font-semibold text-xs tracking-wider uppercase hover:brightness-110 transition-all shadow-md shadow-amber-500/10"
          >
            <Home size={15} />
            Back to Home
          </Link>

          <Link
            href="/#gallery"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-border hover:border-gold/60 text-ivory text-xs font-medium tracking-wide hover:text-gold transition-colors"
          >
            <Images size={15} />
            View Portfolio
          </Link>
        </div>

        {/* Subtle Brand Footer */}
        <div className="mt-8 pt-6 border-t border-border/40 text-[11px] text-stone-dim w-full flex items-center justify-between">
          <span>{brand.name} Studio</span>
          <Link href="/#contact" className="hover:text-gold transition-colors">
            Need help? Contact Himal &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
