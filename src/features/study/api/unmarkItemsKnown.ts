import type { SQLiteDatabase } from "expo-sqlite";

import type { ItemRef } from "../types";

// Undoes "mark as known": deletes the 'known' item rows so the items can be studied again.
// Items that are being learned (or suspended) are left alone, so no progress is lost.
export async function unmarkItemsKnown(db: SQLiteDatabase, items: ItemRef[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const { itemType, itemKey } of items) {
      await db.runAsync(
        "DELETE FROM items WHERE item_type = ? AND item_key = ? AND status = 'known'",
        [itemType, itemKey],
      );
    }
  });
}
