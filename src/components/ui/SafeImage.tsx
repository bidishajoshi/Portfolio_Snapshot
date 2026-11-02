"use client";

import { useState } from "react";
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
  aspectRatio: _aspectRatio,
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

  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState<boolean>(false);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const computedSrc = getValidSrc(src, activeFallback, variant);
  const finalSrc = hasError ? activeFallback : computedSrc;
  const srcSet =
    !hasError && typeof src === "string" && (variant === "medium" || variant === "large")
      ? cloudinarySrcSet(src)
      : undefined;

  return (
    <img
      {...props}
      src={finalSrc}
      srcSet={srcSet || undefined}
      sizes={srcSet ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
      alt={alt || "DR DSLR Photography"}
      loading={priority ? "eager" : loading || "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
      onLoad={(e) => {
        onLoad?.(e);
      }}
      onError={(e) => {
        const target = e.currentTarget;
        target.srcset = "";
        target.src = activeFallback;
        if (!hasError) {
          setHasError(true);
        }
        onError?.(e);
      }}
    />
  );
}
