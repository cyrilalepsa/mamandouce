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

test("dashboard and pregnancy module enforce pregnancy guards", () => {
  const toggle = read("src/components/cycle/PregnancyToggle.jsx");
  const pregnancyPage = read("src/pages/GrossessePage.jsx");
  const tracking = read("src/pages/CycleTrackingPage.jsx");

  assert.match(toggle, /cycle-summary-card/);
  assert.match(toggle, /pregnancy-progress-card/);
  assert.match(toggle, /navigate\(isPregnant \? '\/grossesse' : '\/cycle-tracking'\)/);
  assert.match(pregnancyPage, /grossesse-pregnant-panel/);
  assert.match(pregnancyPage, /grossesse-preconception-card/);
  assert.match(tracking, /'pregnancy-tracking-active'/);
  assert.doesNotMatch(tracking, /if \(isPregnant\) \{\s*\n\s*return/s);
  assert.match(tracking, /pregnancy-cycle-suspended-banner/);
});

test("recent dashboard memos cannot access declarations in the TDZ", () => {
  const toggle = read("src/components/cycle/PregnancyToggle.jsx");
  const usersTab = read("src/components/admin/UsersTab.jsx");
  const subscriptionGate = read("src/components/SubscriptionGate.jsx");

  assert.doesNotMatch(
    toggle,
    /useMemo\s*\(/,
    "dynamic card calculations are cheap and must remain outside useMemo",
  );
  assert.ok(
    toggle.indexOf("function resolvePregnancyInfo") < toggle.indexOf("function PregnancyToggle"),
    "pregnancy helper must be initialized before the component consumes it",
  );
  assert.ok(
    usersTab.indexOf("const groupUsersByDate") < usersTab.indexOf("useMemo("),
    "UsersTab grouping helper must precede its memo",
  );
  assert.ok(
    usersTab.indexOf("const safeUsers") < usersTab.indexOf("const filteredUsers = useMemo"),
    "UsersTab memo dependencies must be initialized first",
  );
  assert.ok(
    subscriptionGate.indexOf("const refreshStatus") < subscriptionGate.indexOf("const contextValue = useMemo"),
    "SubscriptionGate memo dependencies must be initialized first",
  );
});
