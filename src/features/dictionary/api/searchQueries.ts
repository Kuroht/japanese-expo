import type { SQLiteDatabase } from "expo-sqlite";

// The raw SQL for each search mode. All of them return the same row shape,
// already sorted: exact matches first, then by study_order.
export type MatchedWordRow = {
  id: number;
  kanji_text: string | null;
  kana_text: string;
  usually_kana: number | null;
  jlpt: number | null;
  is_common: number;
  match_rank: number;
  study_order: number | null;
};

const SEARCH_LIMIT = 50;

const wordColumns =
  "w.id, w.kanji_text, w.kana_text, w.usually_kana, w.jlpt, w.is_common, w.study_order";
const orderBy = "ORDER BY match_rank, (w.study_order IS NULL), w.study_order";

// LIKE treats % and _ as wildcards, so escape them in what the user typed.
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}

// Japanese search: exact form match first (rank 0), then forms starting with the text (rank 1).
// "Starts with" is written as a text range (text <= f.text < text + U+FFFF) instead of LIKE,
// because a range can use the index on word_forms.text and LIKE can't.
export function queryByForm(db: SQLiteDatabase, text: string): Promise<MatchedWordRow[]> {
  return db.getAllAsync<MatchedWordRow>(
    `SELECT ${wordColumns}, MIN(CASE WHEN f.text = ? THEN 0 ELSE 1 END) AS match_rank
     FROM content.word_forms f JOIN content.words w ON w.id = f.word_id
     WHERE f.text >= ? AND f.text < ?
     GROUP BY w.id ${orderBy} LIMIT ${SEARCH_LIMIT}`,
    [text, text, `${text}￿`],
  );
}

// Turns "green tea" into the FTS query "green"* "tea"*, dropping punctuation.
// \p{L} keeps accented letters, so "café" still works.
function buildFtsQuery(text: string): string {
  const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return words.map((word) => `"${word}"*`).join(" ");
}

// English search with FTS5. A gloss equal to the input counts as an exact match.
// JMdict writes verbs as "to eat", so "to <input>" also counts as exact.
async function queryByFts(db: SQLiteDatabase, text: string): Promise<MatchedWordRow[]> {
  const ftsQuery = buildFtsQuery(text);
  if (!ftsQuery) return [];
  const lowerText = text.trim().toLowerCase();
  return db.getAllAsync<MatchedWordRow>(
    `SELECT ${wordColumns},
       MIN(CASE WHEN lower(glosses_fts.gloss) IN (?, ?) THEN 0 ELSE 1 END) AS match_rank
     FROM content.glosses_fts JOIN content.words w ON w.id = glosses_fts.word_id
     WHERE glosses_fts MATCH ?
     GROUP BY w.id ${orderBy} LIMIT ${SEARCH_LIMIT}`,
    [lowerText, `to ${lowerText}`, ftsQuery],
  );
}

// Slower English search on the senses table, used if FTS5 is unavailable.
// The glosses column is JSON, so an exact gloss looks like "tree" with quotes.
function queryByLike(db: SQLiteDatabase, text: string): Promise<MatchedWordRow[]> {
  const escaped = escapeLike(text);
  return db.getAllAsync<MatchedWordRow>(
    `SELECT ${wordColumns},
       MIN(CASE WHEN s.glosses LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END) AS match_rank
     FROM content.senses s JOIN content.words w ON w.id = s.word_id
     WHERE s.glosses LIKE ? ESCAPE '\\'
     GROUP BY w.id ${orderBy} LIMIT ${SEARCH_LIMIT}`,
    [`%"${escaped}"%`, `%${escaped}%`],
  );
}

// English search: FTS first. Fall back to LIKE only when FTS5 itself is missing;
// any other error (like a broken attach) is a real bug and should show up.
export async function queryByEnglish(db: SQLiteDatabase, text: string): Promise<MatchedWordRow[]> {
  try {
    return await queryByFts(db, text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/fts5|no such module/i.test(message)) throw error;
    console.warn("FTS5 unavailable, using slower LIKE search:", message);
    return queryByLike(db, text);
  }
}
