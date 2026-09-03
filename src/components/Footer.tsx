import Link from "next/link";
import { brand, navLinks, socialLinks } from "@/data/site";
import FacebookIcon from "@/components/icons/FacebookIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";

export default function Footer() {
  return (
    <footer className="bg-ink pt-20 pb-10 border-t border-border">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="#home" className="text-3xl font-display font-medium text-ivory mb-2 tracking-wider inline-block">
              {brand.name}
            </Link>
            <p className="font-display italic text-lg text-cyan-glow/80 mb-6">
              "{brand.tagline}"
            </p>
            <p className="text-sm text-stone max-w-sm leading-relaxed">
              Based in Nepal, available worldwide. Specialising in narrative-driven photography that stands the test of time.
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-xs font-semibold text-ivory uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-8">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-stone hover:text-cyan-glow transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left">
             <h4 className="text-xs font-semibold text-ivory uppercase tracking-widest mb-6">Social Media</h4>
             <ul className="flex flex-col gap-3">
               {socialLinks.map((link) => (
                 <li key={link.platform}>
                    <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-stone hover:text-cyan-glow transition-colors text-sm group">
                      <span className="text-cyan-glow opacity-70 group-hover:opacity-100 transition-opacity">
                        {link.platform.toLowerCase() === "instagram" ? <InstagramIcon size={18} /> : <FacebookIcon size={18} />}
                      </span>
                      <span>{link.platform}</span>
                    </a>
                 </li>
               ))}
             </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-xs text-stone-dim uppercase tracking-wider">{brand.copyright}</p>
           <p className="text-xs text-stone-dim uppercase tracking-wider">Designed for Himal Shrestha</p>
        </div>
      </div>
    </footer>
  );
}
