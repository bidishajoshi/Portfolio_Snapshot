"use client";

import { useState, useEffect } from "react";
import { responsiveMediaUrl, cloudinarySrcSet } from "@/lib/cloudinary/url";

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  variant?: "thumb" | "medium" | "large" | "original";
  aspectRatio?: string;
  priority?: boolean;
}

const DEFAULT_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%230f172a'/><stop offset='50%' stop-color='%231e293b'/><stop offset='100%' stop-color='%230b0f19'/></linearGradient></defs><rect width='800' height='600' fill='url(%23g)'/><circle cx='400' cy='300' r='80' stroke='%2338bdf8' stroke-width='2' fill='none' opacity='0.4'/><circle cx='400' cy='300' r='40' fill='%2338bdf8' opacity='0.2'/><text x='50%' y='520' font-family='sans-serif' font-size='20' fill='%2394a3b8' text-anchor='middle' letter-spacing='2'>DR DSLR PHOTOGRAPHY</text></svg>";

function getValidSrc(
  src: string | Blob | undefined | null,
  fallback: string,
  variant: "thumb" | "medium" | "large" | "original" = "medium"
): string {
  if (typeof src === "string" && src.trim() !== "") {
    if (src.includes("/storage/v1/render/image/public/media/")) {
      return src.replace("/storage/v1/render/image/public/media/", "/storage/v1/object/public/media/").split("?")[0];
    }
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

  const finalSrc = hasError ? activeFallback : getValidSrc(imgSrc, activeFallback, variant);
  const srcSet =
    !hasError && typeof src === "string" && (variant === "medium" || variant === "large")
      ? cloudinarySrcSet(src)
      : undefined;

  return (
    <div className={`relative overflow-hidden bg-ink/60 ${aspectRatio || ""}`}>
      {/* Skeleton Blur & Shimmer Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-ink/80 via-surface-raised/40 to-ink/80 animate-pulse pointer-events-none" />
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
        className={`${className} transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          if (typeof imgSrc === "string" && imgSrc.includes("/storage/v1/render/image/public/media/")) {
            const direct = imgSrc
              .replace("/storage/v1/render/image/public/media/", "/storage/v1/object/public/media/")
              .split("?")[0];
            setImgSrc(direct);
            return;
          }
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
