import type { SQLiteDatabase } from "expo-sqlite";

export type WordStudyState = "none" | "queued" | "learning" | "known";

// Puts a word in the "learn next" list. Adding it twice does nothing.
export async function addWordToStudyQueue(db: SQLiteDatabase, wordId: number): Promise<void> {
  await db.runAsync(
    "INSERT OR IGNORE INTO study_queue (item_type, item_key, added_at) VALUES ('word', ?, ?)",
    [String(wordId), Date.now()],
  );
}

// Where a word is in the user's study: known, being learned, waiting in the queue, or none.
// A suspended word counts as 'none' because it will not show up in study.
export async function isWordQueuedOrStudied(
  db: SQLiteDatabase,
  wordId: number,
): Promise<WordStudyState> {
  const key = String(wordId);
  const item = await db.getFirstAsync<{ status: string }>(
    "SELECT status FROM items WHERE item_type = 'word' AND item_key = ?",
    [key],
  );
  if (item?.status === "known") return "known";
  if (item?.status === "learning") return "learning";
  const queued = await db.getFirstAsync<{ item_key: string }>(
    "SELECT item_key FROM study_queue WHERE item_type = 'word' AND item_key = ?",
    [key],
  );
  return queued ? "queued" : "none";
}
