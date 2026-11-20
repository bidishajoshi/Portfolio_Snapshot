import test from "node:test";
import assert from "node:assert/strict";

interface MockPhoto {
  id: string;
  title: string;
  category: string;
  image: string;
}

interface MockStory {
  id: string;
  title: string;
  slug?: string;
  cover?: string | null;
  introduction?: string | null;
  excerpt?: string | null;
  story_date?: string | null;
  date?: string | null;
  category?: string | null;
}

function resolveGalleryCategories(liveCategories?: string[], photos: MockPhoto[] = []): string[] {
  const photoCategories = Array.from(new Set(photos.map((p) => p.category).filter(Boolean)));
  const combinedCategories = Array.from(new Set([...(liveCategories ?? []), ...photoCategories])).filter(
    (c) => c !== "All"
  );
  return ["All", ...combinedCategories];
}

function filterPhotos(photos: MockPhoto[], selectedCategory: string): MockPhoto[] {
  if (selectedCategory === "All") return photos;
  return photos.filter((p) => p.category === selectedCategory);
}

function resolveStorySlug(story: MockStory): string {
  return story.slug ?? story.title.toLowerCase().replace(/\s+/g, "-");
}

function mapStoryToPhotoDetail(story: MockStory) {
  return {
    id: story.id,
    title: story.title,
    image: story.cover ?? "",
    date: story.story_date ?? story.date ?? null,
    category: story.category ?? null,
    description: story.excerpt ?? story.introduction ?? null,
  };
}

test("resolveGalleryCategories always includes 'All' first and deduplicates categories", () => {
  const photos: MockPhoto[] = [
    { id: "1", title: "P1", category: "Weddings", image: "/1.jpg" },
    { id: "2", title: "P2", category: "Portraits", image: "/2.jpg" },
    { id: "3", title: "P3", category: "Weddings", image: "/3.jpg" },
  ];
  const categories = resolveGalleryCategories(["Portraits", "Landscape"], photos);
  assert.equal(categories[0], "All");
  assert.deepEqual(categories, ["All", "Portraits", "Landscape", "Weddings"]);
});

test("resolveGalleryCategories filters out duplicate 'All' from props", () => {
  const categories = resolveGalleryCategories(["All", "Fashion", "Commercial"], []);
  assert.equal(categories.filter((c) => c === "All").length, 1);
  assert.deepEqual(categories, ["All", "Fashion", "Commercial"]);
});

test("filterPhotos filters accurately by category name", () => {
  const photos: MockPhoto[] = [
    { id: "1", title: "W1", category: "Weddings", image: "/1.jpg" },
    { id: "2", title: "P1", category: "Portraits", image: "/2.jpg" },
  ];
  assert.equal(filterPhotos(photos, "All").length, 2);
  assert.equal(filterPhotos(photos, "Weddings").length, 1);
  assert.equal(filterPhotos(photos, "Weddings")[0].id, "1");
  assert.equal(filterPhotos(photos, "Unknown").length, 0);
});

test("resolveStorySlug generates safe hyphenated slugs when slug is missing", () => {
  assert.equal(
    resolveStorySlug({ id: "s1", title: "A Himalayan Wedding in Mustang" }),
    "a-himalayan-wedding-in-mustang"
  );
  assert.equal(
    resolveStorySlug({ id: "s2", title: "Kathmandu Streets", slug: "custom-kathmandu-slug" }),
    "custom-kathmandu-slug"
  );
});

test("mapStoryToPhotoDetail normalizes dates, covers, and descriptions", () => {
  const story: MockStory = {
    id: "story-1",
    title: "Pokhara Sunset Serenade",
    cover: "/images/pokhara.jpg",
    introduction: "Editorial reflection on dusk light over Phewa Lake.",
    date: "October 2026",
    category: "Landscape",
  };
  const modalPhoto = mapStoryToPhotoDetail(story);
  assert.equal(modalPhoto.id, "story-1");
  assert.equal(modalPhoto.title, "Pokhara Sunset Serenade");
  assert.equal(modalPhoto.image, "/images/pokhara.jpg");
  assert.equal(modalPhoto.date, "October 2026");
  assert.equal(modalPhoto.category, "Landscape");
  assert.equal(modalPhoto.description, "Editorial reflection on dusk light over Phewa Lake.");
});

test("mapStoryToPhotoDetail falls back to null when metadata is empty", () => {
  const story: MockStory = {
    id: "story-2",
    title: "Untitled Story",
  };
  const modalPhoto = mapStoryToPhotoDetail(story);
  assert.equal(modalPhoto.date, null);
  assert.equal(modalPhoto.category, null);
  assert.equal(modalPhoto.description, null);
  assert.equal(modalPhoto.image, "");
});
