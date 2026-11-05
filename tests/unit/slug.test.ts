import test from "node:test";
import assert from "node:assert/strict";
import { slugifyTitle } from "../../src/lib/utils/slug.ts";

test("slugifyTitle creates lowercase hyphenated slugs", () => {
  assert.equal(slugifyTitle("Mountain Sunrise at Annapurna"), "mountain-sunrise-at-annapurna");
  assert.equal(slugifyTitle("DSC 6946 removebg preview"), "dsc-6946-removebg-preview");
});

test("slugifyTitle removes punctuation and invalid characters", () => {
  assert.equal(slugifyTitle("Himal's Studio & Photography!"), "himals-studio-and-photography");
  assert.equal(slugifyTitle("Photo #42 (Final Version)"), "photo-42-final-version");
});

test("slugifyTitle handles empty or whitespace-only strings gracefully", () => {
  assert.equal(slugifyTitle(""), "");
  assert.equal(slugifyTitle("   "), "");
});
