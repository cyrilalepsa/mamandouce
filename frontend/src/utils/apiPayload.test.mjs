import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertNotHtmlApiPayload,
  isHtmlApiResponse,
  looksLikeHtml,
  sanitizeAuthPayload,
} from "./apiPayload.js";

test("looksLikeHtml detects SPA fallback pages", () => {
  assert.equal(looksLikeHtml("<!DOCTYPE html><html><head></head></html>"), true);
  assert.equal(looksLikeHtml("<html lang='fr'><title>MamanDouce</title>"), true);
  assert.equal(looksLikeHtml('{"email":"cyrilalepsa@gmail.com"}'), false);
  assert.equal(looksLikeHtml(null), false);
});

test("sanitizeAuthPayload rejects HTML and keeps user objects", () => {
  assert.throws(
    () => sanitizeAuthPayload("<!doctype html><html></html>"),
    (err) => err && err.code === "API_HTML_FALLBACK",
  );
  const user = { email: "cyrilalepsa@gmail.com", role: "user" };
  assert.equal(sanitizeAuthPayload(user), user);
  assert.equal(sanitizeAuthPayload(null), null);
  assert.equal(sanitizeAuthPayload("token-only"), null);
});

test("isHtmlApiResponse catches content-type and body", () => {
  assert.equal(
    isHtmlApiResponse({
      headers: { "content-type": "text/html; charset=utf-8" },
      data: "<!doctype html>",
    }),
    true,
  );
  assert.equal(
    isHtmlApiResponse({
      headers: { "content-type": "application/json" },
      data: { email: "cyrilalepsa@gmail.com" },
    }),
    false,
  );
  assert.deepEqual(assertNotHtmlApiPayload({ ok: true }), { ok: true });
});
