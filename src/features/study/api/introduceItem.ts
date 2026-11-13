import type { SQLiteDatabase } from "expo-sqlite";

import { cardTypesFor } from "../lib/cardTypesFor";
import { newCardRow } from "../lib/fsrs";
import type { CardRow, ItemRef } from "../types";

// Inserts the item and card rows, with NO transaction of its own, so prepareSession can
// introduce many items inside ONE transaction (expo-sqlite does not nest transactions).
// Safe to call twice (existing rows are kept).
export async function insertItemRows(
  db: SQLiteDatabase,
  item: ItemRef,
  now: number,
): Promise<void> {
  const { itemType, itemKey } = item;
  await db.runAsync(
    "INSERT OR IGNORE INTO items (item_type, item_key, status, introduced_at) VALUES (?, ?, 'learning', ?)",
    [itemType, itemKey, now],
  );
  for (const cardType of cardTypesFor(itemType, itemKey)) {
    const card = newCardRow(itemType, itemKey, cardType, now);
    await db.runAsync(
      `INSERT OR IGNORE INTO cards (item_type, item_key, card_type, due, stability, difficulty,
         elapsed_days, scheduled_days, learning_steps, reps, lapses, state, last_review)
       VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, NULL)`,
      [card.item_type, card.item_key, card.card_type, card.due],
    );
  }
}

// The saved cards of one item.
export function loadItemCards(db: SQLiteDatabase, item: ItemRef): Promise<CardRow[]> {
  return db.getAllAsync<CardRow>(
    "SELECT * FROM cards WHERE item_type = ? AND item_key = ? ORDER BY id",
    [item.itemType, item.itemKey],
  );
}

// Starts learning one item in its own transaction and returns its saved cards.
// withTransactionAsync (not the exclusive one) keeps us on the connection that sees `content`.
export async function introduceItem(
  db: SQLiteDatabase,
  item: ItemRef,
  now: number,
): Promise<CardRow[]> {
  await db.withTransactionAsync(() => insertItemRows(db, item, now));
  return loadItemCards(db, item);
}
