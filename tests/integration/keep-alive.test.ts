import test from "node:test";
import assert from "node:assert/strict";
import { v2 as cloudinary } from "cloudinary";

test("Cloudinary API credentials authenticate and ping successfully", async () => {
  cloudinary.config({
    cloud_name: "ohapodix",
    api_key: "753589682338435",
    api_secret: "SqsABd_zCBWoznX74PceKpM8ufM",
  });

  const pingResult = await cloudinary.api.ping();
  assert.equal(pingResult.status, "ok");
});

test("Cloudinary resources can be listed without throwing unhandled exceptions", async () => {
  cloudinary.config({
    cloud_name: "ohapodix",
    api_key: "753589682338435",
    api_secret: "SqsABd_zCBWoznX74PceKpM8ufM",
  });

  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: "dr-dslr",
    max_results: 5,
  });

  assert.ok(Array.isArray(result.resources));
  assert.ok(result.resources.length > 0);
});
