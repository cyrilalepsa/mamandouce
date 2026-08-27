import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildReminderPayload,
  formatReminderDate,
  normalizeRemindersResponse,
} from "./reminders.js";
import { displayText, normalizeWeeklyTip } from "./weeklyTips.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

test("builds the exact /v1/reminders payload", () => {
  const payload = buildReminderPayload({
    title: "  Échographie  ",
    date: "2026-09-02",
    time: "09:30",
    type: "rdv",
  });
  assert.equal(payload.title, "Échographie");
  assert.equal(payload.type, "rdv");
  assert.equal(payload.reminder_type, "push");
  assert.equal(Number.isNaN(new Date(payload.datetime).getTime()), false);
});

test("normalizes legacy reminder dates and rejects Invalid Date", () => {
  const reminders = normalizeRemindersResponse({
    data: {
      reminders: [
        { id: "r1", appointment_title: "RDV", reminder_datetime: "2026-09-02T09:30:00Z" },
        { id: "broken", datetime: "not-a-date" },
      ],
    },
  });
  assert.equal(reminders.length, 1);
  assert.equal(reminders[0].title, "RDV");
  assert.equal(formatReminderDate("not-a-date"), "Date indisponible");
  assert.doesNotMatch(formatReminderDate(reminders[0].datetime), /Invalid Date/);
});

test("navigation moves Grossesse & Fertilité out of Profile", () => {
  const toggle = read("src/components/cycle/PregnancyToggle.jsx");
  const section = read("src/components/home/navigation/PregnancySection.jsx");
  const profile = read("src/pages/ProfilePage.jsx");
  const nameDay = read("src/components/NameOfTheDay.jsx");
  const cycle = read("src/pages/CycleTrackingPage.jsx");
  const encouragementModal = read("src/components/cycle/PregnancyEncouragementModal.jsx");

  assert.match(toggle, /isPregnant \? '\/pregnancy-fertility' : '\/cycle-tracking'/);
  assert.match(section, /pregnancy-fertility-nav/);
  assert.doesNotMatch(profile, /title="Grossesse & Fertilité"/);
  assert.match(nameDay, /navigate\('\/calendar'\)/);
  const calendarPage = read("src/pages/CalendarPage.jsx");
  assert.match(calendarPage, /data-testid="calendar-page"/);
  assert.match(calendarPage, /data-testid="calendar-back-button"/);
  assert.match(calendarPage, /hideFertilityFeatures=\{isPregnant\}/);
  assert.match(encouragementModal, /pregnancy-encouragement-modal/);
  assert.match(encouragementModal, /pregnancy-encouragement-close/);
  assert.match(cycle, /PregnancyEncouragementModal/);
  assert.match(cycle, /PRECONCEPTION_HUB/);
  assert.match(cycle, /pregnancy-cycle-suspended-banner/);
  assert.match(cycle, /withTimeout\(/);
  assert.match(cycle, /INITIAL_LOAD_SAFETY_MS/);
  assert.match(cycle, /navigate\('\/calendar'/);
  assert.match(cycle, /pregnant-calendar-tab/);
});

test("weekly tip fields never expose raw objects to React", () => {
  const tip = normalizeWeeklyTip({
    week: 12,
    title: { translated: "Fin du trimestre" },
    description: { text: "Tout va bien" },
    development: ["Cerveau", { value: "Organes" }],
    embryo_size: null,
  }, 12);
  assert.equal(tip.title, "Fin du trimestre");
  assert.equal(tip.description, "Tout va bien");
  assert.equal(tip.development, "Cerveau, Organes");
  assert.equal(tip.embryo_size, "—");
  for (const field of ["title", "description", "development", "embryo_size"]) {
    assert.equal(typeof tip[field], "string");
  }
  assert.equal(displayText({ unexpected: true }, "fallback"), "fallback");
  const weeklyPage = read("src/pages/WeeklyTipsPage.jsx");
  assert.doesNotMatch(
    weeklyPage,
    /\(\s*\{\/\* Voile blanc supprimé \*\/\}\s*\)/s,
    "an empty JSX comment expression becomes an invalid object child",
  );
});
