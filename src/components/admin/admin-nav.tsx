"use client";

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
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/albums", label: "Albums", icon: BookImage },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/about", label: "About", icon: User },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/films", label: "Films", icon: Clapperboard },
  { href: "/admin/stories", label: "Stories", icon: Newspaper },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/social", label: "Social Media", icon: Share2 },
  { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-surface/40 px-4 py-8">
      <div className="px-3 mb-8">
        <p className="font-display text-xl text-ivory">DR DSLR</p>
        <p className="text-xs text-stone-dim mt-0.5">{adminName}</p>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
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

      <form action={logoutAction} className="px-3 pt-4 border-t border-border">
        <button
          type="submit"
          className="flex items-center gap-3 text-sm text-stone hover:text-danger transition-colors py-2"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign out
        </button>
      </form>
    </aside>
  );
}
