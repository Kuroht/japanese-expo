import type { SQLiteDatabase } from "expo-sqlite";

import { displayForm } from "@/shared/lib/displayForm";
import { parseStringList } from "@/shared/lib/parseJson";

import { kanjiCharsOf, katakanaToHiragana } from "../lib/furigana";
import type { PracticeSentence, PracticeToken } from "../types";
import { KNOWN_WORD_IDS_SQL, LEARNED_KANJI_SQL } from "./knownWords";

type TokenRow = {
  surface: string;
  reading: string | null;
  word_id: number | null;
  kanji_text: string | null;
  kana_text: string | null;
  usually_kana: number | null;
};

// Loads one sentence with its tokens, ready for the reading screen.
// Returns null when the sentence id does not exist.
export async function getPracticeSentence(
  db: SQLiteDatabase,
  id: number,
): Promise<PracticeSentence | null> {
  const sentence = await db.getFirstAsync<{ id: number; japanese: string; english: string }>(
    "SELECT id, japanese, english FROM content.sentences WHERE id = ?",
    [id],
  );
  if (!sentence) return null;

  const tokenRows = await db.getAllAsync<TokenRow>(
    `SELECT t.surface, t.reading, t.word_id, w.kanji_text, w.kana_text, w.usually_kana
     FROM content.sentence_tokens t
     LEFT JOIN content.words w ON w.id = t.word_id
     WHERE t.sentence_id = ?
     ORDER BY t.position`,
    [id],
  );

  const knownRows = await db.getAllAsync<{ word_id: number }>(KNOWN_WORD_IDS_SQL);
  const kanjiRows = await db.getAllAsync<{ kanji: string }>(LEARNED_KANJI_SQL);
  const knownIds = new Set(knownRows.map((row) => row.word_id));
  const learnedKanji = new Set(kanjiRows.map((row) => row.kanji));
  const firstGlosses = await loadFirstGlosses(db, tokenRows);

  const tokens = tokenRows.map((row) => buildToken(row, knownIds, learnedKanji, firstGlosses));
  return { id: sentence.id, japanese: sentence.japanese, english: sentence.english, tokens };
}

// The first gloss of the first sense for each word in the sentence.
async function loadFirstGlosses(
  db: SQLiteDatabase,
  tokenRows: TokenRow[],
): Promise<Map<number, string>> {
  const wordIds = new Set<number>();
  for (const row of tokenRows) {
    if (row.word_id !== null) wordIds.add(row.word_id);
  }
  const glosses = new Map<number, string>();
  if (wordIds.size === 0) return glosses;

  const idList = [...wordIds];
  const rows = await db.getAllAsync<{ word_id: number; glosses: string }>(
    `SELECT word_id, glosses FROM content.senses
     WHERE word_id IN (${idList.map(() => "?").join(", ")})
     ORDER BY word_id, position`,
    idList,
  );
  for (const row of rows) {
    if (glosses.has(row.word_id)) continue; // rows are sorted, so the first one is the first sense
    const first = parseStringList(row.glosses)[0];
    if (first) glosses.set(row.word_id, first);
  }
  return glosses;
}

function buildToken(
  row: TokenRow,
  knownIds: Set<number>,
  learnedKanji: Set<string>,
  firstGlosses: Map<number, string>,
): PracticeToken {
  const kanjiChars = kanjiCharsOf(row.surface);
  const token: PracticeToken = {
    surface: row.surface,
    reading: katakanaToHiragana(row.reading || row.surface),
    wordId: row.word_id,
    isKnownWord: row.word_id !== null && knownIds.has(row.word_id),
    hasKanji: kanjiChars.length > 0,
    kanjiAllLearned: kanjiChars.every((kanji) => learnedKanji.has(kanji)),
  };
  if (row.word_id === null) return token;
  if (row.kana_text) {
    token.displayForm = displayForm({
      kanjiText: row.kanji_text,
      kanaText: row.kana_text,
      usuallyKana: row.usually_kana === 1,
    });
  }
  const gloss = firstGlosses.get(row.word_id);
  if (gloss) token.firstGloss = gloss;
  return token;
}
