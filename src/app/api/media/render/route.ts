import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eyrwzaapdhjljaxnuzek.supabase.co";
const CACHE_DIR = path.join(process.cwd(), ".next", "cache", "media-render");

// Ensure cache directory exists
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch {
  // Non-fatal if folder cannot be created at boot
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get("path") || "";
  const rawUrl = searchParams.get("url") || "";
  const widthParam = parseInt(searchParams.get("width") || "1200", 10);
  const qualityParam = parseInt(searchParams.get("quality") || "80", 10);

  const targetWidth = Math.min(Math.max(widthParam || 800, 100), 2560);
  const targetQuality = Math.min(Math.max(qualityParam || 80, 40), 95);

  let sourceUrl = "";
  if (rawPath) {
    const cleanPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
    sourceUrl = `${SUPABASE_URL}/storage/v1/object/public/media/${cleanPath}`;
  } else if (rawUrl) {
    sourceUrl = rawUrl;
  }

  if (!sourceUrl) {
    return new NextResponse("Missing image path or url", { status: 400 });
  }

  // Create cache key based on URL, width, and quality
  const cacheKey = crypto
    .createHash("md5")
    .update(`${sourceUrl}_w${targetWidth}_q${targetQuality}`)
    .digest("hex");
  const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.webp`);

  // Return cached file if available
  try {
    if (fs.existsSync(cacheFilePath)) {
      const cachedBuffer = fs.readFileSync(cacheFilePath);
      return new NextResponse(cachedBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Image-Cache": "HIT",
        },
      });
    }
  } catch {
    // Continue if cache read fails
  }

  try {
    // Fetch source image (up to 50MB)
    const response = await fetch(sourceUrl, {
      headers: { Accept: "image/*" },
    });

    if (!response.ok) {
      return new NextResponse(`Source image returned ${response.status}`, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Transform with Sharp: rotate (EXIF), resize, compress to WebP
    const optimizedBuffer = await sharp(inputBuffer)
      .rotate() // Automatically orient based on EXIF
      .resize({
        width: targetWidth,
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({
        quality: targetQuality,
        effort: 4,
      })
      .toBuffer();

    // Write to disk cache in background
    try {
      fs.writeFileSync(cacheFilePath, optimizedBuffer);
    } catch (err) {
      console.warn("Failed to write image cache:", err);
    }

    return new NextResponse(optimizedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Image-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Image optimization error:", error);
    return new NextResponse("Image optimization failed", { status: 500 });
  }
}
