import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCycleSavePayload,
  extractApiErrorDetail,
  parseHabitualLength,
  toYearMonthDay,
} from "./cycleForm.js";

test("toYearMonthDay keeps HTML date values as YYYY-MM-DD", () => {
  assert.equal(toYearMonthDay("2026-08-17"), "2026-08-17");
  assert.equal(toYearMonthDay("2026-08-17T14:30:00.000Z"), "2026-08-17");
  assert.equal(toYearMonthDay("17/08/2026"), "2026-08-17");
  assert.equal(toYearMonthDay("17.08.2026"), "2026-08-17");
  assert.equal(toYearMonthDay(""), "");
  assert.equal(toYearMonthDay(null), "");
});

test("toYearMonthDay uses local calendar components for Date objects", () => {
  const local = new Date(2026, 7, 17, 23, 30);
  assert.equal(toYearMonthDay(local), "2026-08-17");
});

test("parseHabitualLength uses parseInt radix 10", () => {
  assert.equal(parseHabitualLength("28"), 28);
  assert.equal(parseHabitualLength("30 jours"), 30);
  assert.equal(parseHabitualLength(32), 32);
  assert.equal(parseHabitualLength(""), 28);
  assert.equal(parseHabitualLength("abc"), 28);
});

test("buildCycleSavePayload matches backend YYYY-MM-DD + integer cycle_length", () => {
  const payload = buildCycleSavePayload("2026-08-17T00:00:00", "30");
  assert.equal(payload.valid, true);
  assert.equal(payload.last_period_date, "2026-08-17");
  assert.equal(payload.cycle_length, 30);
  assert.deepEqual(payload.errors, []);
});

test("buildCycleSavePayload rejects missing date and out-of-range length", () => {
  assert.equal(buildCycleSavePayload("", "28").valid, false);
  assert.ok(buildCycleSavePayload("2026-08-17", "10").errors.includes("length_range"));
  assert.ok(buildCycleSavePayload("not-a-date", "28").errors.includes("date"));
});

test("extractApiErrorDetail reads FastAPI 422 bodies", () => {
  assert.equal(
    extractApiErrorDetail({ response: { data: { detail: "Date invalide" } } }),
    "Date invalide",
  );
  assert.equal(
    extractApiErrorDetail({
      response: { data: { detail: [{ msg: "cycle_length must be an integer" }] } },
    }),
    "cycle_length must be an integer",
  );
});
