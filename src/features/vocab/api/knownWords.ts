import type { SQLiteDatabase } from "expo-sqlite";

// Word-specific "I already know these" SQL. It repeats a few lines of study's generic
// markItemsKnown/unmarkItemsKnown on purpose: study imports vocab, so vocab importing
// study back would be a circular import.

// Marks words as known: status 'known', no cards, and no use of today's new-item budget.
export async function markWordsKnown(db: SQLiteDatabase, wordIds: number[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const wordId of wordIds) {
      const itemKey = String(wordId);
      await db.runAsync(
        `INSERT INTO items (item_type, item_key, status, introduced_at) VALUES ('word', ?, 'known', NULL)
         ON CONFLICT(item_type, item_key) DO UPDATE SET status = 'known'`,
        [itemKey],
      );
      await db.runAsync("DELETE FROM cards WHERE item_type = 'word' AND item_key = ?", [itemKey]);
    }
  });
}

// Undo: deletes only 'known' rows, so words being learned keep their progress.
export async function unmarkWordsKnown(db: SQLiteDatabase, wordIds: number[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const wordId of wordIds) {
      await db.runAsync(
        "DELETE FROM items WHERE item_type = 'word' AND item_key = ? AND status = 'known'",
        [String(wordId)],
      );
    }
  });
}
