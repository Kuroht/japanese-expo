import type { SQLiteDatabase } from "expo-sqlite";
import { isKatakana } from "wanakana";

import type { LoanwordDetails } from "../types";

const GLOSS_LIMIT = 3;

// The next loanword ids in study order that are not in `items` yet.
// A loanword = a word with no kanji whose reading is all katakana, at least 3 characters, and
// either JLPT-listed or common. GLOB is a cheap first filter; isKatakana double-checks.
export async function loadLoanwordIds(db: SQLiteDatabase, limit: number): Promise<string[]> {
  const rows = await db.getAllAsync<{ id: number; kana_text: string }>(
    `SELECT id, kana_text FROM content.words
     WHERE kanji_text IS NULL
       AND length(kana_text) >= 3
       AND kana_text NOT GLOB '*[^ァ-ヺー]*'
       AND (jlpt IS NOT NULL OR is_common = 1)
       AND CAST(id AS TEXT) NOT IN (SELECT item_key FROM items WHERE item_type = 'loanword')
     ORDER BY study_order IS NULL, study_order, id
     LIMIT ?`,
    [limit * 2],
  );
  return rows.filter((row) => isKatakana(row.kana_text)).map((row) => String(row.id));
}

// The first few English meanings of a loanword, for the intro and the answer screen.
export async function getLoanwordDetails(
  db: SQLiteDatabase,
  id: number,
): Promise<LoanwordDetails | null> {
  const word = await db.getFirstAsync<{ kana_text: string; romaji: string | null }>(
    "SELECT kana_text, romaji FROM content.words WHERE id = ?",
    [id],
  );
  if (!word) return null;
  const senses = await db.getAllAsync<{ glosses: string }>(
    "SELECT glosses FROM content.senses WHERE word_id = ? ORDER BY position",
    [id],
  );
  const glosses = senses.flatMap((sense) => JSON.parse(sense.glosses) as string[]);
  return {
    id,
    kanaText: word.kana_text,
    romaji: word.romaji,
    glosses: glosses.slice(0, GLOSS_LIMIT),
  };
}
