import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  calculateCycleSummary,
  isPregnancyActive,
  pregnancyProgress,
} from "./pregnancyStatus.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

test("profile pregnancy status is authoritative", () => {
  assert.equal(isPregnancyActive({ profile: { is_pregnant: true } }), true);
  assert.equal(
    isPregnancyActive({
      profile: { is_pregnant: false },
      user: { status: "enceinte" },
      storedPregnant: "true",
    }),
    false,
  );
  assert.equal(isPregnancyActive({ user: { pregnancy_status: "pregnant" } }), true);
  assert.equal(isPregnancyActive({ user: { status: "envie_bebe" } }), false);
  assert.equal(
    isPregnancyActive({ profile: { current_week: 24 }, storedPregnant: false }),
    false,
    "current_week is also populated by cycle calculations and is not proof",
  );
});

test("cycle summary and pregnancy progress are deterministic", () => {
  const summary = calculateCycleSummary(
    "2026-08-01",
    28,
    new Date("2026-08-12T12:00:00Z"),
  );
  assert.equal(summary.dayOfCycle, 12);
  assert.equal(summary.daysUntilNextPeriod, 17);
  assert.match(summary.label, /17 jours/);

  assert.deepEqual(
    pregnancyProgress({ current_week: 24, trimester: 2 }),
    { week: 24, trimester: 2 },
  );
});

test("dashboard and profile tracking enforce pregnancy guards", () => {
  const toggle = read("src/components/cycle/PregnancyToggle.jsx");
  const profile = read("src/pages/ProfilePage.jsx");
  const tracking = read("src/pages/CycleTrackingPage.jsx");

  assert.match(toggle, /cycle-summary-card/);
  assert.match(toggle, /pregnancy-progress-card/);
  assert.match(toggle, /navigate\(isPregnant \? '\/tracking' : '\/cycle-tracking'\)/);
  assert.match(profile, /!isPregnant && cycleStatus/);
  assert.match(profile, /isPregnant \? \(/);
  assert.match(tracking, /data-testid="pregnancy-tracking-active"/);
  assert.match(tracking, /if \(!initialLoading && isPregnant\)/);
});
