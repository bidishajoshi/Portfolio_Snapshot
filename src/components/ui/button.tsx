import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
          size === "md" ? "px-5 py-2.5 text-sm" : "px-3.5 py-1.5 text-xs",
          variant === "primary" &&
            "bg-gold text-ink hover:bg-gold-soft",
          variant === "secondary" &&
            "bg-surface-raised text-ivory border border-border hover:border-stone-dim",
          variant === "ghost" &&
            "text-stone hover:text-ivory",
          variant === "danger" &&
            "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
