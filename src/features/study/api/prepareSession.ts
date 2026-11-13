import type { SQLiteDatabase } from "expo-sqlite";

import { buildSession } from "../lib/buildSession";
import { buildQueue, type NewItemWithCards } from "../lib/sessionQueue";
import type { SessionPlan, SessionStep } from "../types";
import { countIntroducedToday, loadDueCards } from "./cardQueries";
import { introduceItem } from "./introduceItem";
import { getNewItemCandidates } from "./newItemCandidates";
import { loadSettings } from "./studySettingsStore";

export type PreparedSession = { plan: SessionPlan; queue: SessionStep[] };

// The "Start session" button: loads everything, picks reviews and new items, saves the new
// items (so their cards have ids) and returns the ordered queue of steps to show.
// Due cards are read BEFORE introducing, so new cards are never counted as reviews.
export async function prepareSession(db: SQLiteDatabase, now: number): Promise<PreparedSession> {
  const settings = await loadSettings(db);
  const dueCards = await loadDueCards(db, now);
  const introducedToday = await countIntroducedToday(db, now);
  const newItemCandidates = await getNewItemCandidates(db, settings.newItemsPerDay);

  const plan = buildSession({ dueCards, newItemCandidates, introducedToday, settings, now });

  const newItems: NewItemWithCards[] = [];
  for (const item of plan.newItems) {
    newItems.push({ item, cards: await introduceItem(db, item, now) });
  }
  return { plan, queue: buildQueue(plan.reviews, newItems) };
}
