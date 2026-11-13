import type { SQLiteDatabase } from "expo-sqlite";

// Saves the user's own mnemonic for a kanji. Empty text deletes the edit, so the default
// shows again. Edits live in the PROGRESS db (mnemonic_edits), and a content rebuild only
// replaces the content db, so an edit is never overwritten.
export async function saveMnemonic(db: SQLiteDatabase, kanji: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (trimmed === "") {
    await db.runAsync("DELETE FROM mnemonic_edits WHERE kanji = ?", [kanji]);
    return;
  }
  await db.runAsync(
    `INSERT INTO mnemonic_edits (kanji, text, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(kanji) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at`,
    [kanji, trimmed, Date.now()],
  );
}
