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
