import type { ItemCardSummary, Stage } from "../types";

// Intervals of this many days or more count as "mature".
export const MATURE_DAYS = 21;

// Decides which stage an item is in, from a summary of its cards.
// Suspended items have no stage (null). Order matters: a card still in a learning step
// wins over everything else, and an item with a mix (some cards Review, some still new)
// is "learning" because it is not finished yet.
export function itemStage(summary: ItemCardSummary): Stage | null {
  if (summary.status === "suspended") return null;
  if (summary.status === "known") return "known";
  if (summary.learningCards > 0) return "learning";
  if (summary.seenCards === 0) return "unseen";
  if (summary.reviewCards < summary.cardCount) return "learning";
  if (summary.minScheduledDays < MATURE_DAYS) return "young";
  return "mature";
}
