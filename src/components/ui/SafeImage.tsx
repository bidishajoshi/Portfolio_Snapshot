"use client";

import { useState, useEffect } from "react";
import { responsiveMediaUrl, cloudinarySrcSet } from "@/lib/cloudinary/url";

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  variant?: "thumb" | "medium" | "large" | "original";
  aspectRatio?: string;
  priority?: boolean;
}

const DEFAULT_FALLBACK = "/images/placeholder/hero.jpg";

function getValidSrc(
  src: string | Blob | undefined | null,
  fallback: string,
  variant: "thumb" | "medium" | "large" | "original" = "medium"
): string {
  if (typeof src === "string" && src.trim() !== "") {
    return responsiveMediaUrl(src, variant);
  }
  if (typeof fallback === "string" && fallback.trim() !== "") {
    return fallback;
  }
  return DEFAULT_FALLBACK;
}

export default function SafeImage({
  src,
  alt,
  variant = "medium",
  fallbackSrc = DEFAULT_FALLBACK,
  className = "",
  aspectRatio,
  priority = false,
  loading,
  onLoad,
  onError,
  ...props
}: SafeImageProps) {
  const activeFallback =
    typeof fallbackSrc === "string" && fallbackSrc.trim() !== ""
      ? fallbackSrc
      : DEFAULT_FALLBACK;

  const [imgSrc, setImgSrc] = useState<string>(() => getValidSrc(src, activeFallback, variant));
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(getValidSrc(src, activeFallback, variant));
    setHasError(false);
    setIsLoaded(false);
  }, [src, activeFallback, variant]);

  const finalSrc = hasError ? activeFallback : imgSrc;
  const srcSet =
    !hasError && typeof src === "string" && (variant === "medium" || variant === "large")
      ? cloudinarySrcSet(src)
      : undefined;

  return (
    <div className={`relative overflow-hidden bg-ink/40 ${aspectRatio || ""}`}>
      {/* Background loading shimmer */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-surface-raised/20 animate-pulse pointer-events-none" />
      )}

      <img
        {...props}
        src={finalSrc}
        srcSet={srcSet || undefined}
        sizes={srcSet ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
        alt={alt || "DR DSLR Photography"}
        loading={priority ? "eager" : loading || "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={`relative z-1 ${className} transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-90"
        }`}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          const target = e.currentTarget;
          target.srcset = "";
          target.src = activeFallback;
          if (!hasError) {
            setHasError(true);
            setImgSrc(activeFallback);
          }
          setIsLoaded(true);
          onError?.(e);
        }}
      />
    </div>
  );
}
