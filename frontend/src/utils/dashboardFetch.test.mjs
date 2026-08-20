import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

test("ProtectedRoute has stable module identity", () => {
  const app = read("src/App.jsx");
  const protectedRoute = app.indexOf("function ProtectedRoute(");
  const appInner = app.indexOf("function AppInner(");

  assert.ok(protectedRoute > 0, "ProtectedRoute must exist");
  assert.ok(
    protectedRoute < appInner,
    "ProtectedRoute must be outside AppInner so auth updates do not remount the dashboard",
  );
  assert.equal(
    (app.match(/function ProtectedRoute\(/g) || []).length,
    1,
    "only one stable ProtectedRoute component is allowed",
  );
});

test("home fetch callbacks are stable and use implemented progress API", () => {
  const home = read("src/pages/HomePage.jsx");

  assert.match(home, /const loadUserData = useCallback\(/);
  assert.match(home, /const loadTrophyData = useCallback\(/);
  assert.match(home, /api\.contributions\.getBadgeProgress\(\)/);
  assert.doesNotMatch(home, /trophies\/progress/);
  assert.match(home, /\[loadUserData, loadTrophyData\]/);
  assert.match(home, /authUser\?\.first_name/);
});

test("dashboard reminders avoid missing /reminders route and swallow 404", () => {
  const reminders = read("src/components/home/UpcomingRemindersCard.jsx");

  assert.match(reminders, /Promise\.allSettled/);
  assert.match(reminders, /api\.medical\.getScheduledReminders\(\)/);
  assert.doesNotMatch(reminders, /api\.get\(['"]\/api\/reminders/);
  assert.match(reminders, /status !== 404/);
  assert.match(reminders, /const loadUpcomingReminders = useCallback\(/);
  assert.match(reminders, /\[loadUpcomingReminders\]/);
});
