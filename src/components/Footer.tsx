import Link from "next/link";
import { brand, navLinks, socialLinks as fallbackSocialLinks } from "@/data/site";
import SocialIcon from "@/components/icons/SocialIcon";

function getSocialUrl(platform: string, url: string): string {
  const p = platform.toLowerCase().trim();
  if (p === "whatsapp") {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const cleanNumber = url.replace(/[^0-9]/g, "");
    return cleanNumber ? `https://wa.me/${cleanNumber}` : "https://wa.me/";
  }
  return url;
}

export default function Footer({
  socialLinks: liveSocialLinks,
  brandOverride,
}: {
  socialLinks?: Array<{ platform: string; url: string; label?: string | null; enabled?: boolean }>;
  brandOverride?: { name?: string; tagline?: string };
}) {
  const activeSocial = (liveSocialLinks && liveSocialLinks.length > 0)
    ? liveSocialLinks.filter((l) => l.enabled !== false)
    : fallbackSocialLinks;
  const displayedBrand = { ...brand, ...brandOverride };

  return (
    <footer className="bg-ink pt-20 pb-12 border-t border-border/50 relative overflow-hidden">
      <div className="section-container">
        {/* Upper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 items-start">
          <div className="md:col-span-6 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="#home" className="text-3xl font-display font-medium text-ivory mb-2 tracking-wider inline-block">
              {displayedBrand.name}
            </Link>
            <p className="font-display italic text-lg text-cyan-glow/90 mb-4">
              &quot;{displayedBrand.tagline}&quot;
            </p>
            <p className="text-sm text-stone max-w-md leading-relaxed">
              DR DSLR is a premier photography & cinematography studio based in Nepal, available worldwide. Creating timeless visual narratives with cinematic emotion and precision.
            </p>
          </div>

          <div className="md:col-span-6 flex flex-col items-center md:items-end text-center md:text-right">
            <h4 className="text-xs font-semibold text-ivory uppercase tracking-widest mb-4">Explore</h4>
            <ul className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 max-w-md">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-stone hover:text-cyan-glow transition-colors text-sm font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dedicated Horizontal Social Media Strip */}
        <div className="py-8 px-6 rounded-2xl bg-surface/60 border border-border/60 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-widest font-mono text-cyan-glow font-semibold">Connect & Follow</p>
            <p className="text-xs text-stone mt-0.5">Stay updated with latest shoots, stories, and behind-the-scenes</p>
          </div>

          {/* HORIZONTAL Social Media Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {activeSocial.map((link) => (
              <a
                key={link.platform}
                href={getSocialUrl(link.platform, link.url)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-ink/70 border border-border/80 text-stone hover:text-ivory hover:border-cyan-glow/60 hover:bg-surface-raised transition-all duration-300 group shadow-sm"
              >
                <span className="text-cyan-glow opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                  <SocialIcon platform={link.platform} size={18} />
                </span>
                <span className="text-xs font-medium tracking-wide">
                  {"label" in link && link.label ? link.label : link.platform}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-dim">
          <p className="uppercase tracking-wider">{brand.copyright}</p>
          <p className="uppercase tracking-wider">Himal Shrestha • DR DSLR Portfolio</p>
        </div>
      </div>
    </footer>
  );
}
