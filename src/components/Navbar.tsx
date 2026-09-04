"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { brand, navLinks } from "@/data/site";
import clsx from "clsx";
import { DslrCameraControl } from "@/components/DslrCameraControl";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass py-4" : "bg-transparent py-6"
      )}
    >
      <div className="section-container flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 z-50">
          <Link
            href="/"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="group text-xl font-display font-medium text-ivory relative tracking-wider cursor-pointer select-none"
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-yellow">
              {brand.name}
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-yellow via-gold to-rose-600 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
          </Link>
          <div className="hidden sm:block">
            <DslrCameraControl />
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6 text-sm font-medium text-stone hover:text-ivory transition-colors">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="hover:text-ivory transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="#contact"
            className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-ink font-semibold hover:brightness-110 transition-all duration-300 rounded-lg text-sm tracking-wide shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Book a Shoot
          </Link>
        </nav>

        {/* Mobile Toggle & Shutter Button */}
        <div className="flex items-center gap-2 md:hidden z-50">
          <DslrCameraControl />
          <button
            className="text-ivory p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-ink z-40 flex flex-col items-center justify-center pt-20"
          >
            <ul className="flex flex-col items-center gap-6 text-xl font-display">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-ivory hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-4">
                 <Link
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-3 bg-gold text-ink rounded text-base font-semibold"
                >
                  Book a Shoot
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
