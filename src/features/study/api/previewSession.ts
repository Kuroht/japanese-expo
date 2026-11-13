import type { SQLiteDatabase } from "expo-sqlite";

import { buildSession, newItemLimit } from "../lib/buildSession";
import type { SessionPlan } from "../types";
import { countIntroducedToday, loadDueCards } from "./cardQueries";
import { getNewItemCandidates } from "./newItemCandidates";
import { loadSettings } from "./studySettingsStore";

// What a session would contain right now, for the home screen. Unlike prepareSession this is
// read-only: it never calls introduceItem, so looking at the home screen changes nothing.
export async function previewSession(db: SQLiteDatabase, now: number): Promise<SessionPlan> {
  const settings = await loadSettings(db);
  const dueCards = await loadDueCards(db, now);
  const introducedToday = await countIntroducedToday(db, now);
  const dueNowCount = dueCards.filter((card) => card.due <= now).length;
  const limit = newItemLimit(dueNowCount, introducedToday, settings);
  const newItemCandidates = limit > 0 ? await getNewItemCandidates(db, limit) : [];

  return buildSession({ dueCards, newItemCandidates, introducedToday, settings, now });
}
