import type { MediaFolder, Media } from "@/types/database";

export interface UploadResult {
  media: Media;
}

interface SignResponse {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

interface CloudinaryUploadResponse {
  public_id?: string;
  resource_type?: string;
  format?: string;
  bytes?: number;
  error?: {
    message?: string;
  };
  message?: string;
}

/**
 * Uploads a single file directly from the browser to Cloudinary,
 * then asks our server to verify and save it in Supabase.
 */
export async function uploadFileToCloudinary(
  file: File,
  opts: {
    folder: MediaFolder;
    title: string;
    altText?: string;
    tags?: string[];
    onProgress?: (percent: number) => void;
  }
): Promise<UploadResult> {
  // Step 1: Get Cloudinary upload signature
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folder: opts.folder,
    }),
  });

  if (!signRes.ok) {
    const body = await signRes.json().catch(() => ({}));

    console.error("CLOUDINARY SIGN FAILED:", {
      status: signRes.status,
      body,
    });

    throw new Error(
      body.details ||
        body.error ||
        "Could not start the upload."
    );
  }

  const sign: SignResponse = await signRes.json();

  // Step 2: Determine image/video
  const kind: "image" | "video" = file.type.startsWith("video/")
    ? "video"
    : "image";

  const resourceType = kind === "video" ? "video" : "image";

  // Step 3: Prepare Cloudinary request
  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);

  // Step 4: Upload directly to Cloudinary
  const uploadResult = await new Promise<CloudinaryUploadResponse>(
    (resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`
    );

    // Upload progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        const percent = Math.round(
          (e.loaded / e.total) * 100
        );

        opts.onProgress(percent);
      }
    };

    // Cloudinary response
    xhr.onload = () => {
      let response: CloudinaryUploadResponse = {};

      try {
        response = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
      } catch {
        response = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("CLOUDINARY UPLOAD SUCCESS:", {
          public_id: response.public_id,
          resource_type: response.resource_type,
          format: response.format,
          bytes: response.bytes,
        });

        resolve(response);
      } else {
        console.error("CLOUDINARY UPLOAD FAILED:", {
          status: xhr.status,
          response,
        });

        reject(
          new Error(
            response.error?.message ||
              response.message ||
              "Upload to Cloudinary failed."
          )
        );
      }
    };

    xhr.onerror = () => {
      console.error("CLOUDINARY NETWORK ERROR");

      reject(
        new Error("Network error during upload.")
      );
    };

    xhr.onabort = () => {
      reject(
        new Error("Cloudinary upload was cancelled.")
      );
    };

      xhr.send(formData);
    }
  );

  // Make sure Cloudinary returned a public_id
  if (!uploadResult.public_id) {
    console.error(
      "CLOUDINARY RESPONSE HAS NO PUBLIC ID:",
      uploadResult
    );

    throw new Error(
      "Cloudinary upload completed but no public ID was returned."
    );
  }

  // Step 5: Confirm upload with our server
  console.log(
    "CONFIRMING CLOUDINARY UPLOAD:",
    uploadResult.public_id
  );

  const confirmRes = await fetch(
    "/api/cloudinary/confirm",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cloudinaryPublicId: uploadResult.public_id,
        kind,
        folder: opts.folder,
        title: opts.title,
        altText: opts.altText,
        tags: opts.tags,
      }),
    }
  );

  // Step 6: Handle confirmation/Supabase error
  if (!confirmRes.ok) {
    const rawBody = await confirmRes.text();
    let body: {
      details?: string;
      detailsFromSupabase?: string;
      error?: string;
    } = {};

    try {
      body = JSON.parse(rawBody) as typeof body;
    } catch {
      // Keep the raw response below when the framework returns non-JSON text.
    }

    console.error(
      "CLOUDINARY CONFIRM FAILED:",
      {
        status: confirmRes.status,
        body,
      }
    );

    throw new Error(
      body.details ||
        body.detailsFromSupabase ||
        body.error ||
        rawBody ||
        "Could not save this photo."
    );
  }

  // Step 7: Return saved media
  const result = await confirmRes.json();

  console.log(
    "MEDIA SAVED SUCCESSFULLY:",
    result
  );

  return result;
}

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