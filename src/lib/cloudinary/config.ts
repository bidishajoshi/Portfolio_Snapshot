import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

/**
 * Configures and returns the server-side Cloudinary SDK instance.
 * CLOUDINARY_API_SECRET never leaves the server — this file is imported
 * only by Route Handlers and Server Actions (see the `server-only` guard).
 */
export function getCloudinary() {
  if (!configured) {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud_name || !api_key || !api_secret) {
      throw new Error(
        "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, " +
          "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
      );
    }

    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    configured = true;
  }

  return cloudinary;
}

/** Folder layout inside Cloudinary, mirrored by the `media_folder` enum. */
export function cloudinaryFolderFor(folder: string) {
  return `dr-dslr/${folder}`;
}
