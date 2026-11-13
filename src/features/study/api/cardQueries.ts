import type { SQLiteDatabase } from "expo-sqlite";

import { groupCardsByItem } from "../lib/groupCardsByItem";
import type { NewItemWithCards } from "../lib/sessionQueue";
import type { CardRow } from "../types";

// All cards that are due, for items that are being learned (known/suspended items are skipped).
// Cards never answered (reps = 0) belong to an item the user has not seen yet (see
// loadUnseenItems), so they are not reviews. The exception is a card whose item has another
// answered card: the user saw that item's intro, so its other cards must still come back.
export function loadDueCards(db: SQLiteDatabase, now: number): Promise<CardRow[]> {
  return db.getAllAsync<CardRow>(
    `SELECT cards.* FROM cards
     JOIN items ON items.item_type = cards.item_type AND items.item_key = cards.item_key
     WHERE items.status = 'learning' AND cards.due <= ?
       AND (cards.reps > 0 OR EXISTS (
         SELECT 1 FROM cards AS seen
         WHERE seen.item_type = cards.item_type AND seen.item_key = cards.item_key
           AND seen.reps > 0))`,
    [now],
  );
}

// Items introduced by an earlier session that was abandoned: status 'learning' but none of
// their cards was ever answered. They get their intro again, oldest first.
export async function loadUnseenItems(db: SQLiteDatabase): Promise<NewItemWithCards[]> {
  const cards = await db.getAllAsync<CardRow>(
    `SELECT cards.* FROM cards
     JOIN items ON items.item_type = cards.item_type AND items.item_key = cards.item_key
     WHERE items.status = 'learning'
       AND NOT EXISTS (
         SELECT 1 FROM cards AS seen
         WHERE seen.item_type = cards.item_type AND seen.item_key = cards.item_key
           AND seen.reps > 0)
     ORDER BY items.introduced_at, items.item_type, items.item_key, cards.id`,
  );
  return groupCardsByItem(cards);
}

// Epoch ms of the most recent local midnight (the "day" for the new-items-per-day limit).
export function startOfLocalDay(now: number): number {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime();
}

// How many items were introduced since local midnight.
export async function countIntroducedToday(db: SQLiteDatabase, now: number): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM items WHERE introduced_at >= ?",
    [startOfLocalDay(now)],
  );
  return row?.total ?? 0;
}
