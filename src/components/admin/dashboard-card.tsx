import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function DashboardCard({
  icon: Icon,
  label,
  value,
  href,
  highlight,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={cn(
        "rounded-sm border border-border bg-surface px-5 py-4 transition-colors",
        href && "hover:border-stone-dim",
        highlight && "border-gold/40"
      )}
    >
      <div className="flex items-center justify-between">
        <Icon size={16} strokeWidth={1.75} className={highlight ? "text-gold" : "text-stone"} />
      </div>
      <p className="mt-3 font-display text-3xl text-ivory">{value}</p>
      <p className="text-xs text-stone-dim mt-1">{label}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
