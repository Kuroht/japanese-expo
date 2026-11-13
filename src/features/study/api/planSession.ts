import type { SQLiteDatabase } from "expo-sqlite";

import { buildSession, freshItemLimit, newItemLimit } from "../lib/buildSession";
import type { NewItemWithCards } from "../lib/sessionQueue";
import type { ItemRef, SessionPlan } from "../types";
import { countIntroducedToday, loadDueCards, loadUnseenItems } from "./cardQueries";
import { getNewItemCandidates } from "./newItemCandidates";
import { loadSettings } from "./studySettingsStore";

export type PlannedSession = {
  plan: SessionPlan; // newItems = unseen items first, then fresh items
  unseen: NewItemWithCards[]; // already in the database, with their cards
  freshItems: ItemRef[]; // not in the database yet
};

// The one place that decides what a session contains. Read-only: prepareSession and
// previewSession both call it, so the home screen can never disagree with the session.
// Unseen items (see loadUnseenItems) take new-item slots first and are not reviews or backlog.
export async function planSession(db: SQLiteDatabase, now: number): Promise<PlannedSession> {
  const settings = await loadSettings(db);
  const dueCards = await loadDueCards(db, now);
  const unseen = await loadUnseenItems(db);
  const introducedToday = await countIntroducedToday(db, now);
  const dueNowCount = dueCards.filter((card) => card.due <= now).length;
  const limit = newItemLimit(dueNowCount, introducedToday, settings);
  const freshLimit = freshItemLimit(limit, unseen.length);
  const newItemCandidates = freshLimit > 0 ? await getNewItemCandidates(db, freshLimit) : [];

  const unseenItems = unseen.map((entry) => entry.item);
  const plan = buildSession({
    dueCards,
    unseenItems,
    newItemCandidates,
    introducedToday,
    settings,
    now,
  });
  return { plan, unseen, freshItems: plan.newItems.slice(unseenItems.length) };
}
