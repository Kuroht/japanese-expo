import type { SQLiteDatabase } from "expo-sqlite";

import { displayForm } from "@/shared/lib/displayForm";
import { parseStringList } from "@/shared/lib/parseJson";

import type { VocabListOptions, VocabListRow, VocabStatus } from "../types";

const GLOSSES_PER_ROW = 3;

type ListRow = {
  id: number;
  kanji_text: string | null;
  kana_text: string;
  usually_kana: number | null;
  jlpt: number | null;
  status: string | null;
};

// Escapes LIKE wildcards in what the user typed.
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}

// Only the two statuses the list shows; anything else (suspended) counts as not started.
function toStatus(status: string | null): VocabStatus {
  return status === "learning" || status === "known" ? status : null;
}

// One page of words in study order, with each word's status from the progress DB (the
// main connection), for the "mark words I already know" screen.
// Search matches kanji, kana, romaji or an English meaning.
export async function listVocabWords(
  db: SQLiteDatabase,
  options: VocabListOptions,
): Promise<VocabListRow[]> {
  const levels = options.jlpt === null ? [5, 4] : [options.jlpt];
  const levelMarks = levels.map(() => "?").join(", ");
  const search = options.search.trim();
  const pattern = `%${escapeLike(search.toLowerCase())}%`;
  const searchSql = search
    ? `AND (w.kanji_text LIKE ? ESCAPE '\\' OR w.kana_text LIKE ? ESCAPE '\\'
         OR w.romaji LIKE ? ESCAPE '\\'
         OR EXISTS (SELECT 1 FROM content.senses s
                    WHERE s.word_id = w.id AND lower(s.glosses) LIKE ? ESCAPE '\\'))`
    : "";
  const searchValues = search ? [pattern, pattern, pattern, pattern] : [];

  const rows = await db.getAllAsync<ListRow>(
    `SELECT w.id, w.kanji_text, w.kana_text, w.usually_kana, w.jlpt, i.status
     FROM content.words w
     LEFT JOIN items i ON i.item_type = 'word' AND i.item_key = CAST(w.id AS TEXT)
     WHERE w.jlpt IN (${levelMarks}) ${searchSql}
     ORDER BY (w.study_order IS NULL), w.study_order, w.id
     LIMIT ? OFFSET ?`,
    [...levels, ...searchValues, options.limit, options.offset],
  );
  const glossesByWord = await loadFirstGlosses(
    db,
    rows.map((row) => row.id),
  );

  return rows.map((row) => ({
    id: row.id,
    displayForm: displayForm({
      kanjiText: row.kanji_text,
      kanaText: row.kana_text,
      usuallyKana: row.usually_kana === 1,
    }),
    kanaText: row.kana_text,
    firstGlosses: glossesByWord.get(row.id) ?? [],
    jlpt: row.jlpt,
    status: toStatus(row.status),
  }));
}

// The first few English meanings of each word, in one query.
async function loadFirstGlosses(
  db: SQLiteDatabase,
  wordIds: number[],
): Promise<Map<number, string[]>> {
  const glossesByWord = new Map<number, string[]>();
  if (wordIds.length === 0) return glossesByWord;

  const marks = wordIds.map(() => "?").join(", ");
  const senses = await db.getAllAsync<{ word_id: number; glosses: string }>(
    `SELECT word_id, glosses FROM content.senses WHERE word_id IN (${marks})
     ORDER BY word_id, position`,
    wordIds,
  );
  for (const sense of senses) {
    const collected = glossesByWord.get(sense.word_id) ?? [];
    const room = GLOSSES_PER_ROW - collected.length;
    if (room > 0) {
      glossesByWord.set(sense.word_id, [
        ...collected,
        ...parseStringList(sense.glosses).slice(0, room),
      ]);
    }
  }
  return glossesByWord;
}
