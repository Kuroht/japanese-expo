import type { SQLiteDatabase } from "expo-sqlite";

import type { CardRow } from "../types";

// All cards that are due, for items that are being learned (known/suspended items are skipped).
export function loadDueCards(db: SQLiteDatabase, now: number): Promise<CardRow[]> {
  return db.getAllAsync<CardRow>(
    `SELECT cards.* FROM cards
     JOIN items ON items.item_type = cards.item_type AND items.item_key = cards.item_key
     WHERE items.status = 'learning' AND cards.due <= ?`,
    [now],
  );
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
