import test from "node:test";
import assert from "node:assert/strict";
import {
  cloudinaryImageUrl,
  responsiveMediaUrl,
  cloudinarySrcSet,
  cloudinaryVideoUrl,
  cloudinaryVideoThumbUrl,
} from "../../src/lib/cloudinary/url.ts";

test("cloudinaryImageUrl returns empty string on empty input", () => {
  assert.equal(cloudinaryImageUrl(""), "");
});

test("cloudinaryImageUrl passes through local static and data URLs unchanged", () => {
  assert.equal(cloudinaryImageUrl("/images/hero.jpg"), "/images/hero.jpg");
  assert.equal(cloudinaryImageUrl("data:image/png;base64,123"), "data:image/png;base64,123");
});

test("cloudinaryImageUrl builds transform URL for Cloudinary public ID", () => {
  const url = cloudinaryImageUrl("dr-dslr/photo/my-sample-photo", {
    width: 800,
    height: 600,
    crop: "fill",
    quality: "auto",
  });

  assert.ok(url.includes("res.cloudinary.com"));
  assert.ok(url.includes("ohapodix"));
  assert.ok(url.includes("w_800"));
  assert.ok(url.includes("h_600"));
  assert.ok(url.includes("c_fill"));
  assert.ok(url.includes("dr-dslr/photo/my-sample-photo"));
});

test("cloudinaryImageUrl normalizes existing res.cloudinary.com URLs", () => {
  const original = "https://res.cloudinary.com/ohapodix/image/upload/v1793844115/dr-dslr/photo/sample.jpg";
  const transformed = cloudinaryImageUrl(original, { width: 300, height: 300, crop: "fill" });

  assert.ok(transformed.includes("res.cloudinary.com"));
  assert.ok(transformed.includes("w_300,h_300,c_fill"));
  assert.ok(transformed.includes("dr-dslr/photo/sample.jpg"));
});

test("responsiveMediaUrl generates appropriate presets", () => {
  const publicId = "dr-dslr/photo/sample";

  const thumb = responsiveMediaUrl(publicId, "thumb");
  assert.ok(thumb.includes("w_400"));
  assert.ok(thumb.includes("c_fill"));

  const medium = responsiveMediaUrl(publicId, "medium");
  assert.ok(medium.includes("w_800"));
  assert.ok(medium.includes("c_limit"));

  const large = responsiveMediaUrl(publicId, "large");
  assert.ok(large.includes("w_1600"));

  const original = responsiveMediaUrl(publicId, "original");
  assert.ok(original.includes("w_2000"));
});

test("cloudinarySrcSet generates valid multi-breakpoint srcset", () => {
  const publicId = "dr-dslr/photo/sample";
  const srcset = cloudinarySrcSet(publicId, [400, 800]);

  assert.ok(srcset.includes("400w"));
  assert.ok(srcset.includes("800w"));
  assert.ok(srcset.includes(", "));
});

test("cloudinaryVideoUrl and thumb generate valid URLs", () => {
  const publicId = "dr-dslr/films/reel-2026";
  const video = cloudinaryVideoUrl(publicId);
  assert.ok(video.includes("/video/upload/"));
  assert.ok(video.includes(publicId));

  const thumb = cloudinaryVideoThumbUrl(publicId, 800);
  assert.ok(thumb.includes(".jpg"));
  assert.ok(thumb.includes("w_800"));
});
