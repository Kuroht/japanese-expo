import type { SQLiteDatabase } from "expo-sqlite";
import { isJapanese, isKana, toKana } from "wanakana";

import type { WordSearchResult } from "../types";
import { parseStringList } from "./parseJson";
import { queryByEnglish, queryByForm, type MatchedWordRow } from "./searchQueries";

const RESULT_LIMIT = 50;
const GLOSSES_PER_RESULT = 3;

// Finds matching rows. The input decides the mode:
// Japanese -> word forms; romaji that becomes pure kana -> kana forms AND English
// (because "tree" or "ban" can be both); anything else -> English.
async function findMatches(db: SQLiteDatabase, input: string): Promise<MatchedWordRow[]> {
  if (isJapanese(input)) {
    return queryByForm(db, input);
  }
  const kana = toKana(input);
  if (!isKana(kana)) {
    return queryByEnglish(db, input);
  }
  const [kanaRows, englishRows] = await Promise.all([
    queryByForm(db, kana),
    queryByEnglish(db, input),
  ]);
  return mergeMatches(kanaRows, englishRows);
}

// Joins two result lists without duplicates, best matches first.
function mergeMatches(first: MatchedWordRow[], second: MatchedWordRow[]): MatchedWordRow[] {
  const byId = new Map<number, MatchedWordRow>();
  for (const row of [...first, ...second]) {
    const existing = byId.get(row.id);
    if (!existing || row.match_rank < existing.match_rank) byId.set(row.id, row);
  }
  const orderValue = (row: MatchedWordRow) => row.study_order ?? Number.MAX_SAFE_INTEGER;
  return [...byId.values()]
    .sort((a, b) => a.match_rank - b.match_rank || orderValue(a) - orderValue(b))
    .slice(0, RESULT_LIMIT);
}

// Loads the first few English meanings for each result, in one query.
async function loadFirstGlosses(
  db: SQLiteDatabase,
  wordIds: number[],
): Promise<Map<number, string[]>> {
  const glossesByWord = new Map<number, string[]>();
  if (wordIds.length === 0) return glossesByWord;

  const placeholders = wordIds.map(() => "?").join(", ");
  const rows = await db.getAllAsync<{ word_id: number; glosses: string }>(
    `SELECT word_id, glosses FROM content.senses
     WHERE word_id IN (${placeholders}) ORDER BY word_id, position`,
    wordIds,
  );
  for (const row of rows) {
    const collected = glossesByWord.get(row.word_id) ?? [];
    const room = GLOSSES_PER_RESULT - collected.length;
    if (room > 0) {
      glossesByWord.set(row.word_id, [
        ...collected,
        ...parseStringList(row.glosses).slice(0, room),
      ]);
    }
  }
  return glossesByWord;
}

// Searches the dictionary for what the user typed. Empty input gives no results.
export async function searchWords(
  db: SQLiteDatabase,
  rawInput: string,
): Promise<WordSearchResult[]> {
  const input = rawInput.trim();
  if (!input) return [];

  const matches = await findMatches(db, input);
  const glossesByWord = await loadFirstGlosses(
    db,
    matches.map((row) => row.id),
  );

  return matches.map((row) => ({
    id: row.id,
    kanjiText: row.kanji_text,
    kanaText: row.kana_text,
    jlpt: row.jlpt,
    isCommon: row.is_common === 1,
    firstGlosses: glossesByWord.get(row.id) ?? [],
  }));
}
