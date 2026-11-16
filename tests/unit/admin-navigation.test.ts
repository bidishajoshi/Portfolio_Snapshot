import test from "node:test";
import assert from "node:assert/strict";
import { categoryInputSchema } from "../../src/lib/validation/category.ts";
import { albums } from "../../src/data/albums.ts";
import { stories } from "../../src/data/stories.ts";

test("categoryInputSchema accepts valid category payload with default values", () => {
  const result = categoryInputSchema.safeParse({
    name: "Himalayan Landscapes",
    description: "High-altitude mountain and valley photography across Nepal.",
  });
  assert.ok(result.success, "Valid category should pass schema parsing");
  if (result.success) {
    assert.equal(result.data.name, "Himalayan Landscapes");
    assert.equal(result.data.published, true, "published should default to true");
  }
});

test("categoryInputSchema rejects empty category names", () => {
  const result = categoryInputSchema.safeParse({
    name: "",
  });
  assert.equal(result.success, false, "Empty category name must fail validation");
});

test("categoryInputSchema validates UUID fields when provided", () => {
  const validUuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const validResult = categoryInputSchema.safeParse({
    name: "Weddings",
    coverMediaId: validUuid,
    ogMediaId: null,
  });
  assert.ok(validResult.success, "Valid UUIDs and null should be accepted");

  const invalidResult = categoryInputSchema.safeParse({
    name: "Weddings",
    coverMediaId: "not-a-valid-uuid",
  });
  assert.equal(invalidResult.success, false, "Malformed UUID should fail validation");
});

test("fallback albums dataset has valid structure and slug formats", () => {
  assert.ok(albums.length > 0, "Albums dataset should not be empty");
  for (const album of albums) {
    assert.ok(album.title.length > 0, "Album title must not be empty");
    assert.match(album.slug, /^[a-z0-9-]+$/, `Album slug "${album.slug}" must be URL-safe`);
    assert.ok(album.photos.length > 0, "Each fallback album must contain at least one photo");
    for (const photo of album.photos) {
      assert.ok(photo.image.length > 0, "Photo image URL must not be empty");
    }
  }
});

test("fallback stories dataset has valid slugs and excerpts", () => {
  assert.ok(stories.length > 0, "Stories dataset should not be empty");
  for (const story of stories) {
    assert.ok(story.title.length > 0, "Story title must not be empty");
    assert.match(story.slug, /^[a-z0-9-]+$/, `Story slug "${story.slug}" must be URL-safe`);
    assert.ok(story.cover.length > 0, "Story cover URL must not be empty");
  }
});
