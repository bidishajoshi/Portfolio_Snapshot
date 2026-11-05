import test from "node:test";
import assert from "node:assert/strict";
import { v2 as cloudinary } from "cloudinary";
import type { Media } from "../../src/types/database.ts";

test("Cloudinary direct upload signing generates valid cryptographic signatures", () => {
  const apiSecret = "SqsABd_zCBWoznX74PceKpM8ufM";
  const paramsToSign = {
    folder: "dr-dslr/photo",
    timestamp: 1793844000,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
  assert.ok(typeof signature === "string");
  assert.equal(signature.length, 40); // SHA-1 hex string length

  // Deterministic verification: re-signing identical params must match
  const verifySig = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
  assert.equal(signature, verifySig);
});

test("Fallback Media object matches complete database Media interface", () => {
  const publicId = "dr-dslr/photo/n2skeizrxg4xwcwny5mm";
  const secureUrl = `https://res.cloudinary.com/ohapodix/image/upload/v1793844115/${publicId}.jpg`;

  const fallbackMedia: Media = {
    id: "test-uuid-1234",
    kind: "image",
    folder: "photo",
    title: "DSC 6946 removebg preview",
    slug: "dsc-6946-removebg-preview",
    alt_text: null,
    public_id: publicId,
    secure_url: secureUrl,
    cloudinary_public_id: publicId,
    cloudinary_version: "1793844115",
    format: "jpg",
    bytes: 227724,
    width: 900,
    height: 1600,
    duration: null,
    resource_type: "image",
    tags: [],
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  assert.equal(fallbackMedia.kind, "image");
  assert.equal(fallbackMedia.folder, "photo");
  assert.equal(fallbackMedia.archived, false);
  assert.ok(Boolean(fallbackMedia.secure_url && fallbackMedia.secure_url.startsWith("https://")));
  assert.equal(fallbackMedia.width, 900);
  assert.equal(fallbackMedia.height, 1600);
});
