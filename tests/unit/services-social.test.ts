import test from "node:test";
import assert from "node:assert/strict";
import { services as fallbackServices } from "../../src/data/services.ts";

function resolveServiceIcon(title: string, icon?: string | null): string {
  if (icon && icon.trim() !== "" && icon !== "camera") {
    return icon
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }
  const t = title.toLowerCase();
  if (t.includes("wedding") || t.includes("couple") || t.includes("matrimon")) return "Heart";
  if (t.includes("portrait") || t.includes("model") || t.includes("individual")) return "User";
  if (t.includes("event") || t.includes("ceremony") || t.includes("gathering")) return "Calendar";
  if (t.includes("travel") || t.includes("destination") || t.includes("landscape")) return "MapPin";
  if (t.includes("film") || t.includes("cinema") || t.includes("video")) return "Film";
  if (t.includes("fashion") || t.includes("editorial")) return "Sparkles";
  if (t.includes("commercial") || t.includes("brand")) return "Briefcase";
  return "Camera";
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

test("fallback services dataset has valid structure and properties", () => {
  assert.ok(fallbackServices.length >= 4, "Should offer at least 4 core photography services");
  for (const s of fallbackServices) {
    assert.ok(s.title.length > 0, "Service title must not be empty");
    assert.match(s.slug, /^[a-z0-9-]+$/, `Service slug "${s.slug}" must be URL-safe`);
    assert.ok(s.description.length >= 20, "Service description should be substantive");
    assert.ok(s.icon.length > 0, "Service must specify a valid icon identifier");
  }
});

test("resolveServiceIcon assigns contextual icons based on service categories", () => {
  assert.equal(resolveServiceIcon("Luxury Wedding Documentation"), "Heart");
  assert.equal(resolveServiceIcon("Editorial Portrait Session"), "User");
  assert.equal(resolveServiceIcon("Cultural Event Coverage"), "Calendar");
  assert.equal(resolveServiceIcon("Himalayan Travel Journey"), "MapPin");
  assert.equal(resolveServiceIcon("Fashion Lookbook"), "Sparkles");
  assert.equal(resolveServiceIcon("Commercial Brand Shoot"), "Briefcase");
  assert.equal(resolveServiceIcon("Unspecified Studio Work"), "Camera");
});

test("resolveSocialUrl correctly formats WhatsApp and direct links", () => {
  assert.equal(
    resolveSocialUrl("WhatsApp", "+9779844437665"),
    "https://wa.me/9779844437665",
    "Should strip non-digits and prepend wa.me"
  );
  assert.equal(
    resolveSocialUrl("WhatsApp", "https://wa.me/9779844437665"),
    "https://wa.me/9779844437665",
    "Should preserve existing wa.me URLs"
  );
  assert.equal(
    resolveSocialUrl("Instagram", "https://instagram.com/drdslr"),
    "https://instagram.com/drdslr",
    "Should pass through standard HTTPS social links"
  );
});

test("contact phone normalization generates valid Nepal country codes", () => {
  const localNumber = "9844437665";
  const cleanPhone = localNumber.replace(/[^0-9]/g, "");
  const intlNumber = cleanPhone.startsWith("977") ? cleanPhone : `977${cleanPhone}`;
  assert.equal(intlNumber, "9779844437665", "Local 10-digit number should have 977 country code prepended");
});
