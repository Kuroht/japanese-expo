import type { StudySettings } from "../types";

// Defaults sized for a session of about 15 minutes.
export const DEFAULT_STUDY_SETTINGS: StudySettings = {
  newItemsPerDay: 8,
  maxReviewsPerSession: 60,
  showHardEasy: false,
};

// Rough time per answered card and per new item (intro + first cards), in seconds.
const SECONDS_PER_REVIEW = 8;
const SECONDS_PER_NEW_ITEM = 40;

// Estimated session length in whole minutes (rounded up), for the "Start session" screen.
export function estimateMinutes(plan: { reviews: unknown[]; newItems: unknown[] }): number {
  const seconds =
    plan.reviews.length * SECONDS_PER_REVIEW + plan.newItems.length * SECONDS_PER_NEW_ITEM;
  return Math.ceil(seconds / 60);
}

// A whole number inside min..max. Anything that is not a finite number gives the fallback;
// a number outside the range is moved to the nearest end (a decimal is rounded first).
function cleanNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

// Turns anything read from the database (or typed by the settings screen) into valid settings,
// so a bad saved value can never break the session planner.
export function cleanStudySettings(value: unknown): StudySettings {
  const saved =
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const defaults = DEFAULT_STUDY_SETTINGS;
  return {
    newItemsPerDay: cleanNumber(saved.newItemsPerDay, 0, 50, defaults.newItemsPerDay),
    maxReviewsPerSession: cleanNumber(
      saved.maxReviewsPerSession,
      10,
      500,
      defaults.maxReviewsPerSession,
    ),
    showHardEasy:
      typeof saved.showHardEasy === "boolean" ? saved.showHardEasy : defaults.showHardEasy,
  };
}
