import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, isAllowedMediaFile } from "@/lib/validation/media";
import type { MediaFolder, Media } from "@/types/database";

export interface UploadResult {
  media: Media;
}

export interface ProgressDetail {
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  loadedMb: string;
  totalMb: string;
  formatted: string;
}

export type ProgressCallback = (progress: number | ProgressDetail) => void;

interface SupabaseSignResponse {
  storageType: "supabase";
  signedUrl: string;
  path: string;
  token: string;
  bucket: string;
  publicUrl: string;
}

interface CloudinarySignResponse {
  storageType: "cloudinary";
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

type SignResponse = SupabaseSignResponse | CloudinarySignResponse;

interface CloudinaryUploadResponse {
  public_id?: string;
  secure_url?: string;
  resource_type?: "image" | "video";
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  error?: {
    message?: string;
  };
  message?: string;
}

/**
 * Uploads a single file directly from the browser to Storage (Supabase Storage or Cloudinary).
 * File bytes stream directly from client to storage without passing through the Next.js server.
 * Supports up to 50 MB per individual file.
 */
export async function uploadFileToCloudinary(
  file: File,
  opts: {
    folder: MediaFolder;
    title: string;
    altText?: string;
    tags?: string[];
    onProgress?: ProgressCallback;
  }
): Promise<UploadResult> {
  // Step 0: Client-side validation before any network request
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `File exceeds maximum size of ${MAX_FILE_SIZE_MB} MB (selected file is ${sizeMb} MB).`
    );
  }

  if (!isAllowedMediaFile(file.name, file.type)) {
    throw new Error(
      "Unsupported format (allowed: JPG, PNG, WebP, HEIC, TIFF, AVIF, MP4, MOV)"
    );
  }

  const kind: "image" | "video" = file.type.startsWith("video/")
    ? "video"
    : "image";

  // Measure image dimensions client-side if possible
  let naturalWidth: number | undefined;
  let naturalHeight: number | undefined;
  if (kind === "image" && typeof window !== "undefined") {
    try {
      if ("createImageBitmap" in window) {
        const bmp = await createImageBitmap(file);
        naturalWidth = bmp.width;
        naturalHeight = bmp.height;
        bmp.close();
      }
    } catch {
      // Non-fatal if dimension extraction fails (e.g. raw TIFF/HEIC in unsupported browser)
    }
  }

  // Step 1: Request signed upload authorization from server
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folder: opts.folder,
      filename: file.name,
      contentType: file.type || "image/jpeg",
      storageType: "supabase", // Default to Supabase to support 50 MB
    }),
  });

  if (!signRes.ok) {
    const body = await signRes.json().catch(() => ({}));
    console.error("STORAGE SIGN FAILED:", { status: signRes.status, body });
    throw new Error(
      body.details || body.error || "Could not initialize upload authorization."
    );
  }

  const sign: SignResponse = await signRes.json();

  const emitProgress = (loaded: number, total: number) => {
    if (!opts.onProgress) return;
    const safeTotal = total > 0 ? total : file.size;
    const percent = Math.min(100, Math.round((loaded / safeTotal) * 100));
    const loadedMb = (loaded / (1024 * 1024)).toFixed(1);
    const totalMb = (safeTotal / (1024 * 1024)).toFixed(1);
    const detail: ProgressDetail = {
      percent,
      loadedBytes: loaded,
      totalBytes: safeTotal,
      loadedMb,
      totalMb,
      formatted: `${loadedMb} MB / ${totalMb} MB (${percent}%)`,
    };
    opts.onProgress(detail);
  };

  // Step 2A: Direct upload to Supabase Storage (50 MB limit)
  if (sign.storageType === "supabase") {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", sign.signedUrl);
      xhr.timeout = 0; // Disable timeout for large 50 MB high-resolution uploads

      const contentType = file.type || "image/jpeg";
      xhr.setRequestHeader("Content-Type", contentType);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          emitProgress(e.loaded, e.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          emitProgress(file.size, file.size);
          resolve();
        } else {
          console.error("SUPABASE UPLOAD FAILED:", xhr.status, xhr.responseText);
          reject(new Error(`Direct storage upload failed (HTTP ${xhr.status}).`));
        }
      };

      xhr.onerror = () => {
        console.error("SUPABASE UPLOAD NETWORK ERROR");
        reject(
          new Error("Network connection error during file upload. Please check your connection and try again.")
        );
      };

      xhr.ontimeout = () => {
        console.error("SUPABASE UPLOAD TIMEOUT");
        reject(
          new Error("Upload timed out. Please check your internet speed and try again.")
        );
      };

      xhr.onabort = () => {
        reject(new Error("Upload was cancelled."));
      };

      xhr.send(file);
    });

    // Confirm upload with server and record media
    const confirmRes = await fetch("/api/cloudinary/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storageType: "supabase",
        storagePath: sign.path,
        secureUrl: sign.publicUrl,
        kind,
        folder: opts.folder,
        title: opts.title,
        altText: opts.altText,
        tags: opts.tags,
        bytes: file.size,
        width: naturalWidth,
        height: naturalHeight,
        format: file.name.split(".").pop()?.toLowerCase() || "jpg",
      }),
    });

    if (!confirmRes.ok) {
      const raw = await confirmRes.text();
      let body: { details?: string; error?: string } = {};
      try {
        body = JSON.parse(raw);
      } catch {
        // keep raw
      }
      throw new Error(
        body.details || body.error || raw || "Failed to save photo record after upload."
      );
    }

    const saved = await confirmRes.json();
    return saved;
  }

  // Step 2B: Legacy Cloudinary fallback (for files < 10 MB if configured)
  const resourceType = kind === "video" ? "video" : "image";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);

  const uploadResult = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`);
    xhr.timeout = 0;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        emitProgress(e.loaded, e.total);
      }
    };

    xhr.onload = () => {
      let response: CloudinaryUploadResponse = {};
      try {
        response = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
      } catch {
        response = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        reject(
          new Error(response.error?.message || response.message || `Upload failed (HTTP ${xhr.status}).`)
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during file upload. Please check your connection and try again."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Upload timed out. Please check your internet speed and try again."));
    };

    xhr.onabort = () => {
      reject(new Error("Upload was cancelled."));
    };

    xhr.send(formData);
  });

  if (!uploadResult.public_id) {
    throw new Error("Upload completed but no asset ID was returned.");
  }

  const confirmRes = await fetch("/api/cloudinary/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storageType: "cloudinary",
      cloudinaryPublicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      resourceType: uploadResult.resource_type,
      format: uploadResult.format,
      bytes: uploadResult.bytes || file.size,
      width: uploadResult.width || naturalWidth,
      height: uploadResult.height || naturalHeight,
      duration: uploadResult.duration,
      kind,
      folder: opts.folder,
      title: opts.title,
      altText: opts.altText,
      tags: opts.tags,
    }),
  });

  if (!confirmRes.ok) {
    const raw = await confirmRes.text();
    let body: { details?: string; error?: string } = {};
    try {
      body = JSON.parse(raw);
    } catch {
      // keep raw
    }
    throw new Error(
      body.details || body.error || raw || "Failed to save photo record after upload."
    );
  }

  return confirmRes.json();
}

/** Alias for direct clarity */
export const uploadFileDirect = uploadFileToCloudinary;

/**
 * Derives a clean starting title from a raw filename:
 * IMG_8293.JPG -> "IMG 8293"
 */
export function titleFromFilename(
  filename: string
): string {
  const withoutExt = filename.replace(
    /\.[^/.]+$/,
    ""
  );

  return withoutExt
    .replace(/[_-]+/g, " ")
    .trim();
}