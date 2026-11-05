import test from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedMediaFile,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  confirmUploadSchema,
  mediaSearchSchema,
  mediaFolderSchema,
} from "../../src/lib/validation/media.ts";

test("MAX_FILE_SIZE is 50 megabytes", () => {
  assert.equal(MAX_FILE_SIZE_MB, 50);
  assert.equal(MAX_FILE_SIZE_BYTES, 50 * 1024 * 1024);
});

test("isAllowedMediaFile accepts supported photo and video formats", () => {
  assert.equal(isAllowedMediaFile("test.jpg"), true);
  assert.equal(isAllowedMediaFile("test.JPEG"), true);
  assert.equal(isAllowedMediaFile("test.png"), true);
  assert.equal(isAllowedMediaFile("test.webp"), true);
  assert.equal(isAllowedMediaFile("test.heic"), true);
  assert.equal(isAllowedMediaFile("test.tiff"), true);
  assert.equal(isAllowedMediaFile("test.avif"), true);
  assert.equal(isAllowedMediaFile("clip.mp4"), true);
  assert.equal(isAllowedMediaFile("clip.mov"), true);
  assert.equal(isAllowedMediaFile("blob", "image/png"), true);
  assert.equal(isAllowedMediaFile("blob", "video/mp4"), true);
});

test("isAllowedMediaFile rejects dangerous or invalid extensions", () => {
  assert.equal(isAllowedMediaFile("document.pdf"), false);
  assert.equal(isAllowedMediaFile("script.sh"), false);
  assert.equal(isAllowedMediaFile("payload.exe"), false);
  assert.equal(isAllowedMediaFile("archive.zip"), false);
  assert.equal(isAllowedMediaFile("file_without_ext"), false);
});

test("mediaFolderSchema allows only canonical folder categories", () => {
  assert.equal(mediaFolderSchema.safeParse("photo").success, true);
  assert.equal(mediaFolderSchema.safeParse("hero").success, true);
  assert.equal(mediaFolderSchema.safeParse("profile").success, true);
  assert.equal(mediaFolderSchema.safeParse("album").success, true);
  assert.equal(mediaFolderSchema.safeParse("video").success, true);
  assert.equal(mediaFolderSchema.safeParse("invalid-folder").success, false);
});

test("confirmUploadSchema validates complete payload correctly", () => {
  const validData = {
    storageType: "cloudinary",
    cloudinaryPublicId: "dr-dslr/photo/sample-123",
    publicId: "dr-dslr/photo/sample-123",
    secureUrl: "https://res.cloudinary.com/ohapodix/image/upload/v1/sample.jpg",
    resourceType: "image",
    format: "jpg",
    bytes: 204800,
    width: 1920,
    height: 1080,
    kind: "image",
    folder: "photo",
    title: "Mountain Sunrise",
    altText: "Sunrise over Himalayas",
    tags: ["nepal", "mountain"],
  };

  const result = confirmUploadSchema.safeParse(validData);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.title, "Mountain Sunrise");
    assert.equal(result.data.format, "jpg");
    assert.equal(result.data.storageType, "cloudinary");
  }
});

test("confirmUploadSchema handles null and optional metadata gracefully", () => {
  const minimalData = {
    cloudinaryPublicId: "dr-dslr/photo/sample-minimal",
    kind: "image",
    folder: "photo",
    title: "", // empty title should transform to fallback "Untitled"
    width: null,
    height: null,
    bytes: null,
    altText: null,
    tags: null,
  };

  const result = confirmUploadSchema.safeParse(minimalData);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.title, "Untitled");
    assert.equal(result.data.storageType, "cloudinary");
  }
});

test("mediaSearchSchema supplies proper pagination defaults", () => {
  const parsed = mediaSearchSchema.parse({});
  assert.equal(parsed.page, 1);
  assert.equal(parsed.pageSize, 40);
  assert.equal(parsed.includeArchived, false);
});
