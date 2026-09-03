"use client";

import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {label && (
        <p className="text-label mb-4">{label}</p>
      )}
      <h2 className="heading-section">{title}</h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-stone text-base md:text-lg leading-relaxed mx-auto">
          {subtitle}
        </p>
      )}
      <hr
        className={cn(
          "gold-line mt-6",
          align === "center" && "mx-auto"
        )}
      />
    </div>
  );
}
