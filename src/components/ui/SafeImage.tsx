"use client";

import { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%230f172a'/><stop offset='50%' stop-color='%231e293b'/><stop offset='100%' stop-color='%230b0f19'/></linearGradient></defs><rect width='800' height='600' fill='url(%23g)'/><circle cx='400' cy='300' r='80' stroke='%2338bdf8' stroke-width='2' fill='none' opacity='0.4'/><circle cx='400' cy='300' r='40' fill='%2338bdf8' opacity='0.2'/><text x='50%' y='520' font-family='sans-serif' font-size='20' fill='%2394a3b8' text-anchor='middle' letter-spacing='2'>DR DSLR PHOTOGRAPHY</text></svg>";

function getValidSrc(src: string | undefined | null, fallback: string): string {
  if (typeof src === "string" && src.trim() !== "") {
    return src;
  }
  if (typeof fallback === "string" && fallback.trim() !== "") {
    return fallback;
  }
  return DEFAULT_FALLBACK;
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className,
  ...props
}: SafeImageProps) {
  const activeFallback =
    typeof fallbackSrc === "string" && fallbackSrc.trim() !== ""
      ? fallbackSrc
      : DEFAULT_FALLBACK;

  const [imgSrc, setImgSrc] = useState<string>(() => getValidSrc(src, activeFallback));
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(getValidSrc(src, activeFallback));
    setHasError(false);
  }, [src, activeFallback]);

  const finalSrc = hasError ? activeFallback : getValidSrc(imgSrc, activeFallback);

  return (
    <img
      {...props}
      src={finalSrc}
      alt={alt || "Photography"}
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(activeFallback);
        }
      }}
    />
  );
}

