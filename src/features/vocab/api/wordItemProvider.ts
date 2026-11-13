import type { SQLiteDatabase } from "expo-sqlite";

import { pickWordCandidates, type WordCandidateRow } from "../lib/pickWordCandidates";
import type { WordItemRef } from "../types";

// The new-item provider for JMdict words (the study engine asks it for new items).
export async function wordItemProvider(
  db: SQLiteDatabase,
  isIntroduced: (itemType: string, itemKey: string) => boolean,
  limit: number,
): Promise<WordItemRef[]> {
  // N5 + N4 is only a few thousand small rows, so filtering in JS keeps the SQL simple.
  const rows = await db.getAllAsync<WordCandidateRow>(
    `SELECT id, jlpt, study_order, kanji_text, kana_text FROM content.words
     WHERE jlpt IN (4, 5)`,
  );
  return pickWordCandidates(rows, isIntroduced, limit);
}
