import test from "node:test";
import assert from "node:assert/strict";
import { brand, contact, socialLinks, navLinks } from "../../src/data/site.ts";
import { cn } from "../../src/lib/utils/cn.ts";

test("brand configuration provides valid branding metadata", () => {
  assert.equal(brand.name, "DR DSLR");
  assert.equal(brand.photographer, "Himal Shrestha");
  assert.ok(brand.tagline.length > 0, "Brand tagline must not be empty");
  assert.match(brand.copyright, /DR DSLR/);
});

test("contact configuration contains valid email and phone", () => {
  assert.match(contact.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Contact email must be valid");
  assert.ok(contact.phone.length >= 7, "Phone number must be at least 7 digits");
  assert.equal(contact.location, "Kathmandu, Nepal");
});

test("social links contain properly formed URLs and platform identifiers", () => {
  assert.ok(socialLinks.length >= 3, "At least three social links should be configured");
  for (const item of socialLinks) {
    assert.ok(item.platform.length > 0, "Platform name must not be empty");
    assert.ok(item.url.length > 0, "URL must not be empty");
    assert.equal(typeof item.enabled, "boolean");
  }
});

test("navLinks map to valid homepage section hashes", () => {
  assert.ok(navLinks.length >= 5, "Navigation bar must contain essential sections");
  const hrefs = navLinks.map((l) => l.href);
  assert.ok(hrefs.includes("#home"), "Navigation must link to home");
  assert.ok(hrefs.includes("#gallery"), "Navigation must link to gallery");
  assert.ok(hrefs.includes("#contact"), "Navigation must link to contact");
});

test("cn utility merges and dedupes Tailwind classes correctly", () => {
  assert.equal(cn("px-2 py-1", "bg-gold"), "px-2 py-1 bg-gold");
  assert.equal(cn("text-stone", false && "font-bold", "font-medium"), "text-stone font-medium");
  assert.equal(cn("text-stone", "text-ivory"), "text-ivory", "Conflicting text colors should merge to the latest");
  assert.equal(cn("p-4", "p-2"), "p-2", "Tailwind merge should override conflicting utility classes");
});
