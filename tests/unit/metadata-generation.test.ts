import test from "node:test";
import assert from "node:assert/strict";
import { albums as fallbackAlbums, type AlbumData } from "../../src/data/albums.ts";
import { stories as fallbackStories, type StoryData } from "../../src/data/stories.ts";

interface DbAlbumRecord {
  title?: string | null;
  description?: string | null;
  coverUrl?: string | null;
}

interface DbStoryRecord {
  title?: string | null;
  introduction?: string | null;
  coverUrl?: string | null;
}

export function clipMetaDescription(text?: string | null, maxLength = 160): string {
  if (!text || !text.trim()) {
    return "DR DSLR Photography studio by Himal Shrestha, Nepal.";
  }
  const clean = text.trim();
  return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength - 3).trim()}...`;
}

export function resolveAlbumMetadata(
  slug: string,
  dbAlbum?: DbAlbumRecord | null,
  albumsList: AlbumData[] = fallbackAlbums
) {
  let title = "Album";
  let description = "Explore photographic collections by Himal Shrestha.";
  let coverUrl = "/og-image.jpg";

  if (dbAlbum) {
    if (dbAlbum.title?.trim()) title = dbAlbum.title.trim();
    if (dbAlbum.description?.trim()) description = clipMetaDescription(dbAlbum.description);
    if (dbAlbum.coverUrl?.trim()) coverUrl = dbAlbum.coverUrl.trim();
  } else {
    const matched = albumsList.find((a) => a.slug === slug || String(a.id) === slug);
    if (matched) {
      title = matched.title;
      description = clipMetaDescription(matched.description);
      coverUrl = matched.cover || matched.photos?.[0]?.image || "/og-image.jpg";
    }
  }

  const pageTitle = `${title} — Album`;
  return {
    title: pageTitle,
    description,
    coverUrl,
    openGraph: {
      title: `${pageTitle} | DR DSLR`,
      description,
      type: "website",
      images: [{ url: coverUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | DR DSLR`,
      description,
      images: [coverUrl],
    },
  };
}

export function resolveStoryMetadata(
  slug: string,
  dbStory?: DbStoryRecord | null,
  storiesList: StoryData[] = fallbackStories
) {
  let title = "Visual Story";
  let description = "Capturing moments beyond vision — photo essays and stories by Himal Shrestha.";
  let coverUrl = "/og-image.jpg";

  if (dbStory) {
    if (dbStory.title?.trim()) title = dbStory.title.trim();
    if (dbStory.introduction?.trim()) description = clipMetaDescription(dbStory.introduction);
    if (dbStory.coverUrl?.trim()) coverUrl = dbStory.coverUrl.trim();
  } else {
    const matched = storiesList.find((s) => s.slug === slug || String(s.id) === slug);
    if (matched) {
      title = matched.title;
      description = clipMetaDescription(matched.excerpt);
      coverUrl = matched.cover || "/og-image.jpg";
    }
  }

  const pageTitle = `${title} — Visual Story`;
  return {
    title: pageTitle,
    description,
    coverUrl,
    openGraph: {
      title: `${pageTitle} | DR DSLR`,
      description,
      type: "article",
      images: [{ url: coverUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | DR DSLR`,
      description,
      images: [coverUrl],
    },
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────

test("resolveAlbumMetadata matches fallback album by slug", () => {
  const meta = resolveAlbumMetadata("wedding-memories");
  assert.equal(meta.title, "Wedding Memories — Album");
  assert.match(meta.description, /heartfelt wedding moments/);
  assert.ok(meta.coverUrl.startsWith("http"));
  assert.equal(meta.openGraph.type, "website");
  assert.equal(meta.twitter.card, "summary_large_image");
});

test("resolveAlbumMetadata matches fallback album by numeric id string", () => {
  const meta = resolveAlbumMetadata("1");
  assert.equal(meta.title, "Wedding Memories — Album");
  assert.equal(meta.openGraph.images[0].alt, "Wedding Memories");
});

test("resolveAlbumMetadata prioritizes database album record when available", () => {
  const meta = resolveAlbumMetadata("custom-event", {
    title: "Pokhara Cultural Gala",
    description: "Exclusive cultural celebration captured in the heart of Pokhara.",
    coverUrl: "https://res.cloudinary.com/dr-dslr/image/upload/v1/sample.jpg",
  });
  assert.equal(meta.title, "Pokhara Cultural Gala — Album");
  assert.equal(meta.description, "Exclusive cultural celebration captured in the heart of Pokhara.");
  assert.equal(meta.coverUrl, "https://res.cloudinary.com/dr-dslr/image/upload/v1/sample.jpg");
});

test("resolveStoryMetadata matches fallback story and extracts excerpt", () => {
  const meta = resolveStoryMetadata("mountains-through-my-lens");
  assert.equal(meta.title, "The Mountains Through My Lens — Visual Story");
  assert.match(meta.description, /Annapurna range/);
  assert.equal(meta.openGraph.type, "article");
  assert.ok(meta.coverUrl.length > 0);
});

test("clipMetaDescription clips text cleanly to 160 characters", () => {
  const longText = "A".repeat(200);
  const clipped = clipMetaDescription(longText, 160);
  assert.ok(clipped.length <= 160);
  assert.ok(clipped.endsWith("..."));

  const shortText = "Short description";
  assert.equal(clipMetaDescription(shortText), "Short description");
  assert.equal(clipMetaDescription(""), "DR DSLR Photography studio by Himal Shrestha, Nepal.");
});

test("resolveAlbumMetadata returns safe fallback when album is not found", () => {
  const meta = resolveAlbumMetadata("non-existent-album", null, []);
  assert.equal(meta.title, "Album — Album");
  assert.equal(meta.coverUrl, "/og-image.jpg");
  assert.equal(meta.openGraph.images[0].url, "/og-image.jpg");
});
