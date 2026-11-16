"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  BookImage,
  Tags,
  Home,
  User,
  Sparkles,
  Clapperboard,
  Newspaper,
  Quote,
  Share2,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/media", label: "Media Library", icon: Images },
  { href: "/admin/gallery", label: "Selected Stories", icon: Images },
  { href: "/admin/albums", label: "Featured Albums", icon: BookImage },
  { href: "/admin/stories", label: "Visual Stories", icon: Newspaper },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/about", label: "About Himal", icon: User },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/films", label: "Films", icon: Clapperboard },
  { href: "/admin/testimonials", label: "Client Reviews", icon: Quote },
  { href: "/admin/social", label: "Social Media", icon: Share2 },
  { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileOpen(false);
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  const currentItem = NAV_ITEMS.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  return (
    <>
      {/* Mobile Top Header (Screens < 768px) */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="font-display text-base font-semibold text-ivory">DR DSLR</p>
          <p className="text-[11px] text-stone-dim">
            {currentItem ? currentItem.label : adminName}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-stone hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile Slide-down Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="flex h-full max-h-[85vh] w-full flex-col overflow-y-auto border-b border-border bg-ink p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <p className="font-display text-lg text-ivory">DR DSLR Admin</p>
                <p className="text-xs text-stone-dim">{adminName}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 text-stone hover:text-ivory"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-surface-raised font-medium text-ivory"
                        : "text-stone hover:bg-surface-raised/60 hover:text-ivory"
                    )}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border mt-4 flex flex-col gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-stone hover:text-gold transition-colors py-1.5"
              >
                <ExternalLink size={15} />
                View Live Site (opens new tab)
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 text-sm text-stone hover:text-red-400 transition-colors py-2"
                >
                  <LogOut size={16} strokeWidth={1.75} />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar (Screens >= 768px) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-surface/40 px-4 py-8">
        <div className="px-3 mb-8">
          <p className="font-display text-xl text-ivory">DR DSLR</p>
          <p className="text-xs text-stone-dim mt-0.5">{adminName}</p>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-surface-raised text-ivory"
                    : "text-stone hover:text-ivory hover:bg-surface-raised/60"
                )}
              >
                <Icon size={16} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-4 border-t border-border flex flex-col gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-stone hover:text-gold transition-colors py-1"
          >
            <ExternalLink size={14} />
            View Live Site
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 text-sm text-stone hover:text-danger transition-colors py-1"
            >
              <LogOut size={16} strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
