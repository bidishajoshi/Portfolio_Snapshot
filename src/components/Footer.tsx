import Link from "next/link";
import { brand, contact, navLinks, socialLinks as fallbackSocialLinks } from "@/data/site";
import SocialIcon from "@/components/icons/SocialIcon";
import { Mail, Phone, MapPin } from "lucide-react";

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
    <footer className="relative overflow-hidden bg-gradient-to-br from-ink via-ink-deep to-maroon-dark bg-gradient-animate border-t border-border pt-20 pb-8 text-stone">
      {/* Top Gradient Overlay for a subtle bleed effect */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-maroon-deep to-transparent opacity-50" />
      
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col items-start hover-lift">
            <Link href="#home" className="text-3xl font-display font-medium text-ivory tracking-wide mb-3 inline-block">
              {displayedBrand.name}
            </Link>
            <p className="font-display italic text-base text-cyan-glow mb-4">
              &quot;{displayedBrand.tagline}&quot;
            </p>
            <p className="text-sm leading-relaxed max-w-xs text-stone">
              {brand.supportingText || "Creating timeless visual narratives with cinematic emotion and precision. Available worldwide."}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-start lg:pl-8">
            <h4 className="text-sm font-semibold text-ivory uppercase tracking-widest mb-6">Explore</h4>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium hover:text-ivory transition-colors link-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col items-start">
            <h4 className="text-sm font-semibold text-ivory uppercase tracking-widest mb-6">Contact</h4>
            <ul className="flex flex-col gap-4 text-sm">
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-cyan-glow transition-colors group">
                  <Mail size={16} className="text-maroon-deep group-hover:text-cyan-glow transition-colors" />
                  <span className="link-underline">{contact.email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 hover:text-cyan-glow transition-colors group">
                  <Phone size={16} className="text-maroon-deep group-hover:text-cyan-glow transition-colors" />
                  <span className="link-underline">{contact.phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-maroon-deep mt-0.5 shrink-0" />
                <span>{contact.location}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div className="flex flex-col items-start">
            <h4 className="text-sm font-semibold text-ivory uppercase tracking-widest mb-6">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {activeSocial.map((link) => (
                <a
                  key={link.platform}
                  href={getSocialUrl(link.platform, link.url)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.platform}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border hover:border-cyan-glow hover:bg-surface-raised transition-all duration-300 icon-glow"
                >
                  <SocialIcon platform={link.platform} size={18} />
                </a>
              ))}
            </div>
          </div>
          
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-dim">
          <p className="tracking-wider">{displayedBrand.copyright}</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-cyan-glow transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-cyan-glow transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
