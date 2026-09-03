"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { brand, navLinks } from "@/data/site";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Track scroll position for glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section via Intersection Observer
  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "glass py-3" : "py-5 bg-transparent"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="section-container flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => handleNavClick("#home")}
            className="flex items-center gap-2 group"
            aria-label="Go to top"
          >
            <span className="font-display text-xl md:text-2xl text-ivory tracking-wide">
              {brand.name}
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors duration-300",
                  activeSection === link.href.replace("#", "")
                    ? "text-ivory"
                    : "text-stone hover:text-ivory"
                )}
              >
                {link.label}
                {activeSection === link.href.replace("#", "") && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-gold rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick("#contact")}
              className="hidden md:inline-flex px-5 py-2 text-sm font-medium bg-gold text-ink rounded-sm hover:bg-gold-soft transition-colors duration-300"
            >
              Book a Shoot
            </button>

            {/* Hamburger */}
            <button
              className="lg:hidden p-2 text-ivory"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-40 bg-ink/98 backdrop-blur-xl flex flex-col items-center justify-center gap-6 lg:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => handleNavClick(link.href)}
                className={cn(
                  "text-2xl font-display transition-colors",
                  activeSection === link.href.replace("#", "")
                    ? "text-gold"
                    : "text-ivory hover:text-gold"
                )}
              >
                {link.label}
              </motion.button>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * navLinks.length }}
              onClick={() => handleNavClick("#contact")}
              className="mt-4 px-8 py-3 text-sm font-medium bg-gold text-ink rounded-sm hover:bg-gold-soft transition-colors"
            >
              Book a Shoot
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
