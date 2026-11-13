import type { CardRow, ItemRef, SessionPlan, StudySettings } from "../types";
import { retrievability } from "./fsrs";

type BuildSessionInput = {
  dueCards: CardRow[];
  unseenItems: ItemRef[]; // introduced earlier but never answered (abandoned session)
  newItemCandidates: ItemRef[]; // fresh items, already trimmed to freshItemLimit
  introducedToday: number;
  settings: StudySettings;
  now: number;
};

// Sorts due cards so the ones most likely forgotten come first (lowest retrievability).
function sortByForgetting(cards: CardRow[], now: number): CardRow[] {
  const scored = cards.map((card) => ({ card, chance: retrievability(card, now) }));
  scored.sort((a, b) => a.chance - b.chance || a.card.due - b.card.due);
  return scored.map((entry) => entry.card);
}

// How many new items to allow. A big backlog means fewer (or no) new items,
// so skipping days never makes the next session heavier.
// Exported so the session APIs can ask the providers for exactly this many items: then the
// kanji-prerequisite trimming (which never splits a word from its kanji) uses the real limit.
export function newItemLimit(dueCount: number, introducedToday: number, settings: StudySettings) {
  const remainingToday = Math.max(0, settings.newItemsPerDay - introducedToday);
  if (dueCount > 3 * settings.maxReviewsPerSession) return 0;
  if (dueCount > settings.maxReviewsPerSession) return Math.floor(remainingToday / 2);
  return remainingToday;
}

// How many brand-new items may still be introduced. Unseen items (introduced earlier, never
// answered) use up slots first, so an abandoned session never makes the next one bigger.
export function freshItemLimit(limit: number, unseenCount: number): number {
  return Math.max(0, limit - unseenCount);
}

// Picks what to study now. Cards that do not fit stay due and come back next session,
// which spreads a backlog over several days.
export function buildSession(input: BuildSessionInput): SessionPlan {
  const { dueCards, unseenItems, newItemCandidates, introducedToday, settings, now } = input;
  const dueNow = dueCards.filter((card) => card.due <= now);
  const reviews = sortByForgetting(dueNow, now).slice(0, settings.maxReviewsPerSession);
  const limit = newItemLimit(dueNow.length, introducedToday, settings);
  // The candidates were already trimmed to the limit by the providers. Do NOT slice again:
  // the first prerequisite group may overflow the limit on purpose (a word and its kanji
  // are never split). Unseen items come first and are never reviews or backlog.
  const freshItems = limit === 0 ? [] : newItemCandidates;
  return { reviews, newItems: [...unseenItems, ...freshItems] };
}
