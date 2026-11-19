import test from "node:test";
import assert from "node:assert/strict";
import { contact, brand } from "../../src/data/site.ts";

function resolveDisplayedContact(
  fallback: typeof contact,
  override?: {
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    whatsapp?: string | null;
  }
) {
  return {
    email: override?.email?.trim() || fallback.email,
    phone: override?.phone?.trim() || fallback.phone,
    location: override?.location?.trim() || fallback.location,
    whatsapp: override?.whatsapp?.trim() || undefined,
  };
}

function resolveTargetWhatsApp(
  configuredWhatsApp?: string | null,
  fallbackPhone?: string | null
): { target: string; international: string } {
  const rawPhone = configuredWhatsApp?.trim() || fallbackPhone?.trim() || "9844437665";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
  const targetWhatsAppNumber = cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10) || "9844437665";
  const intlWhatsAppNumber = cleanPhone.startsWith("977")
    ? cleanPhone
    : `977${targetWhatsAppNumber}`;

  return { target: targetWhatsAppNumber, international: intlWhatsAppNumber };
}

function resolveBrandName(brandName?: string | null, fallback: string = brand.name): string {
  return brandName?.trim() || fallback;
}

test("resolveDisplayedContact preserves fallbacks when override is missing or null", () => {
  const result = resolveDisplayedContact(contact, undefined);
  assert.equal(result.email, contact.email);
  assert.equal(result.phone, contact.phone);
  assert.equal(result.location, contact.location);
  assert.equal(result.whatsapp, undefined);
});

test("resolveDisplayedContact applies partial overrides and sanitizes whitespace", () => {
  const result = resolveDisplayedContact(contact, {
    email: "   studio@drdslr.com   ",
    phone: null,
    location: "Pokhara, Nepal",
    whatsapp: "9841234567",
  });
  assert.equal(result.email, "studio@drdslr.com");
  assert.equal(result.phone, contact.phone, "Null phone should fall back to default");
  assert.equal(result.location, "Pokhara, Nepal");
  assert.equal(result.whatsapp, "9841234567");
});

test("resolveTargetWhatsApp formats 10-digit local numbers into international format", () => {
  const { target, international } = resolveTargetWhatsApp("9844437665", contact.phone);
  assert.equal(target, "9844437665");
  assert.equal(international, "9779844437665");
});

test("resolveTargetWhatsApp preserves numbers that already start with country code", () => {
  const { international } = resolveTargetWhatsApp("9779812345678", contact.phone);
  assert.equal(international, "9779812345678");
});

test("resolveTargetWhatsApp strips punctuation and spaces from raw numbers", () => {
  const { international } = resolveTargetWhatsApp("+977 (984) 443-7665", contact.phone);
  assert.equal(international, "9779844437665");
});

test("resolveBrandName handles custom overrides, whitespace, and fallback brand names", () => {
  assert.equal(resolveBrandName("DR DSLR Cinema"), "DR DSLR Cinema");
  assert.equal(resolveBrandName("   DR DSLR Pro   "), "DR DSLR Pro");
  assert.equal(resolveBrandName(null), brand.name);
  assert.equal(resolveBrandName("   "), brand.name);
});
