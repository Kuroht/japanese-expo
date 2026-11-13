import type { SQLiteDatabase } from "expo-sqlite";

import { cardTypesFor } from "../lib/cardTypesFor";
import { newCardRow } from "../lib/fsrs";
import type { CardRow, ItemRef } from "../types";

// Starts learning an item: one `items` row plus one `cards` row per card type, in one
// transaction. Safe to call twice (existing rows are kept). Returns the item's saved cards.
// withTransactionAsync (not the exclusive one) keeps us on the connection that sees `content`.
export async function introduceItem(
  db: SQLiteDatabase,
  item: ItemRef,
  now: number,
): Promise<CardRow[]> {
  const { itemType, itemKey } = item;
  await db.withTransactionAsync(async () => {
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
  });
  return db.getAllAsync<CardRow>(
    "SELECT * FROM cards WHERE item_type = ? AND item_key = ? ORDER BY id",
    [itemType, itemKey],
  );
}
