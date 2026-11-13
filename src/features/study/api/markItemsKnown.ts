import type { SQLiteDatabase } from "expo-sqlite";

import type { ItemRef } from "../types";

// Marks items as already known: status 'known' and no cards, so they never take session time.
// introduced_at stays empty, so known items do not use up today's new-item budget.
// Any cards the item had are deleted; their review_log rows stay for the stats.
export async function markItemsKnown(db: SQLiteDatabase, items: ItemRef[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const { itemType, itemKey } of items) {
      await db.runAsync(
        `INSERT INTO items (item_type, item_key, status, introduced_at) VALUES (?, ?, 'known', NULL)
         ON CONFLICT(item_type, item_key) DO UPDATE SET status = 'known', introduced_at = NULL`,
        [itemType, itemKey],
      );
      await db.runAsync("DELETE FROM cards WHERE item_type = ? AND item_key = ?", [
        itemType,
        itemKey,
      ]);
    }
  });
}
