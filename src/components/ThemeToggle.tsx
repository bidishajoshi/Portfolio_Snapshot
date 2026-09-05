"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center">
        <span className="w-5 h-5 opacity-0"></span>
      </div>
    );
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 rounded-full flex items-center justify-center text-stone hover:text-ivory bg-surface/50 hover:bg-surface border border-border/50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow shadow-sm"
      aria-label="Toggle Theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : -90,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 text-cyan-glow"
        >
          <Moon size={20} className="fill-cyan-glow/20" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
            rotate: isDark ? 90 : 0,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 text-yellow"
        >
          <Sun size={20} className="fill-yellow/20" />
        </motion.div>
      </div>
    </button>
  );
}
