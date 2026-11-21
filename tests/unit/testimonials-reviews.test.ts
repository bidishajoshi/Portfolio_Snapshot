import test from "node:test";
import assert from "node:assert/strict";

interface PublicReviewInput {
  name: string;
  email: string;
  rating: number;
  review: string;
  eventType?: string;
  honeypot?: string;
}

function validatePublicReviewInput(input: PublicReviewInput) {
  // 1. Anti-spam honeypot check
  if (input.honeypot && input.honeypot.trim() !== "") {
    return { isSpam: true, success: true };
  }

  // 2. Input validation
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const review = input.review?.trim();
  const rating = Number(input.rating);
  const eventType = input.eventType?.trim() || null;

  if (!name || name.length < 2) {
    throw new Error("Please enter your full name (at least 2 characters).");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!review || review.length < 10) {
    throw new Error("Please write a review or comment (at least 10 characters).");
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error("Please select a rating between 1 and 5 stars.");
  }

  return {
    isSpam: false,
    data: { name, email, review, rating, eventType },
  };
}

function normalizeDisplayedTestimonial(item: {
  client_name: string;
  review: string;
  rating?: number | null;
  event_type?: string | null;
  avatar?: string | null;
}) {
  return {
    name: item.client_name,
    review: item.review,
    rating: item.rating ?? 5,
    eventType: item.event_type ?? "Client",
    avatar: item.avatar && item.avatar.trim() !== "" ? item.avatar : null,
  };
}

test("validatePublicReviewInput flags honeypot filled submissions as spam", () => {
  const result = validatePublicReviewInput({
    name: "Spambot",
    email: "bot@example.com",
    rating: 5,
    review: "Buy cheap crypto now!",
    honeypot: "http://spam-link.com",
  });
  assert.equal(result.isSpam, true);
});

test("validatePublicReviewInput enforces minimum 2 characters for client name", () => {
  assert.throws(
    () =>
      validatePublicReviewInput({
        name: "A",
        email: "valid@email.com",
        rating: 5,
        review: "Great photographer in Nepal!",
      }),
    /Please enter your full name/
  );
});

test("validatePublicReviewInput validates email format and lowercases it", () => {
  assert.throws(
    () =>
      validatePublicReviewInput({
        name: "Aarav Sharma",
        email: "not-an-email",
        rating: 5,
        review: "Incredible wedding photoshoot!",
      }),
    /Please enter a valid email address/
  );

  const valid = validatePublicReviewInput({
    name: "Aarav Sharma",
    email: "  AARAV@Email.Com  ",
    rating: 5,
    review: "Incredible wedding photoshoot!",
  });
  assert.equal(valid.data?.email, "aarav@email.com");
});

test("validatePublicReviewInput enforces minimum 10 characters for review body", () => {
  assert.throws(
    () =>
      validatePublicReviewInput({
        name: "Pooja Gurung",
        email: "pooja@example.com",
        rating: 5,
        review: "Too short", // 9 characters
      }),
    /Please write a review or comment/
  );
});

test("validatePublicReviewInput validates rating boundaries between 1 and 5", () => {
  assert.throws(
    () =>
      validatePublicReviewInput({
        name: "Pooja Gurung",
        email: "pooja@example.com",
        rating: 0,
        review: "Exceptional visual storytelling and editing.",
      }),
    /Please select a rating between 1 and 5 stars/
  );

  assert.throws(
    () =>
      validatePublicReviewInput({
        name: "Pooja Gurung",
        email: "pooja@example.com",
        rating: 6,
        review: "Exceptional visual storytelling and editing.",
      }),
    /Please select a rating between 1 and 5 stars/
  );

  const validFive = validatePublicReviewInput({
    name: "Pooja Gurung",
    email: "pooja@example.com",
    rating: 5,
    review: "Exceptional visual storytelling and editing.",
  });
  assert.equal(validFive.data?.rating, 5);
});

test("normalizeDisplayedTestimonial supplies proper defaults for null ratings, event types, and empty avatars", () => {
  const normalized = normalizeDisplayedTestimonial({
    client_name: "Bikash Thapa",
    review: "Captured the heart and warmth of our traditional wedding ceremony.",
    rating: null,
    event_type: null,
    avatar: "   ",
  });
  assert.equal(normalized.rating, 5);
  assert.equal(normalized.eventType, "Client");
  assert.equal(normalized.avatar, null);
});

test("normalizeDisplayedTestimonial preserves valid avatar URLs", () => {
  const normalized = normalizeDisplayedTestimonial({
    client_name: "Anita Rai",
    review: "Outstanding cinematic frames.",
    rating: 5,
    event_type: "Editorial Shoot",
    avatar: "https://res.cloudinary.com/dr-dslr/image/upload/v1/avatar.jpg",
  });
  assert.equal(normalized.avatar, "https://res.cloudinary.com/dr-dslr/image/upload/v1/avatar.jpg");
  assert.equal(normalized.eventType, "Editorial Shoot");
});
