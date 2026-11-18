import test from "node:test";
import assert from "node:assert/strict";
import { contact, brand, processSteps } from "../../src/data/site.ts";

function resolveFooterContact(
  fallback: typeof contact,
  override?: { email?: string | null; phone?: string | null; location?: string | null }
) {
  return {
    email: override?.email?.trim() || fallback.email,
    phone: override?.phone?.trim() || fallback.phone,
    location: override?.location?.trim() || fallback.location,
  };
}

function resolveSocialUrl(platform: string, url: string): string {
  const p = platform.toLowerCase().trim();
  if (p === "whatsapp") {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const cleanNumber = url.replace(/[^0-9]/g, "");
    return cleanNumber ? `https://wa.me/${cleanNumber}` : "https://wa.me/";
  }
  return url;
}

test("resolveFooterContact preserves default contact info when no override is provided", () => {
  const resolved = resolveFooterContact(contact, undefined);
  assert.equal(resolved.email, contact.email);
  assert.equal(resolved.phone, contact.phone);
  assert.equal(resolved.location, contact.location);
});

test("resolveFooterContact selectively applies partial contact overrides", () => {
  const partial = resolveFooterContact(contact, {
    email: "custom-studio@drdslr.com",
    phone: null,
  });
  assert.equal(partial.email, "custom-studio@drdslr.com");
  assert.equal(partial.phone, contact.phone, "Null phone should fall back to default phone");
  assert.equal(partial.location, contact.location, "Undefined location should fall back to default location");
});

test("resolveFooterContact ignores empty whitespace-only overrides", () => {
  const resolved = resolveFooterContact(contact, {
    email: "   ",
    phone: "",
    location: "   Pokhara, Nepal   ",
  });
  assert.equal(resolved.email, contact.email);
  assert.equal(resolved.phone, contact.phone);
  assert.equal(resolved.location, "Pokhara, Nepal");
});

test("processSteps contains ordered, non-empty experience workflow steps", () => {
  assert.ok(processSteps.length >= 4, "Experience timeline should have at least 4 workflow steps");
  processSteps.forEach((step, idx) => {
    const expectedNum = String(idx + 1).padStart(2, "0");
    assert.equal(step.number, expectedNum, `Step index ${idx} must have sequential number ${expectedNum}`);
    assert.ok(step.title.trim().length > 0, `Step ${step.number} must have a non-empty title`);
    assert.ok(step.description.trim().length > 10, `Step ${step.number} must have a descriptive body`);
  });
});

test("resolveSocialUrl converts phone strings to canonical wa.me links", () => {
  assert.equal(resolveSocialUrl("WhatsApp", "+977 980-000-0000"), "https://wa.me/9779800000000");
  assert.equal(resolveSocialUrl("whatsapp", "https://wa.me/9779812345678"), "https://wa.me/9779812345678");
  assert.equal(resolveSocialUrl("instagram", "https://instagram.com/dr_dslr"), "https://instagram.com/dr_dslr");
});

test("brand override integrates with fallback brand properties", () => {
  const merged = { ...brand, name: "DR DSLR Cinema", tagline: "Crafted Moments" };
  assert.equal(merged.name, "DR DSLR Cinema");
  assert.equal(merged.tagline, "Crafted Moments");
  assert.equal(merged.photographer, brand.photographer);
});
