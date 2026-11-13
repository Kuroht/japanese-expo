import type { SQLiteDatabase } from "expo-sqlite";

import type { KanjiRow } from "@/shared/db/types";
import { displayForm } from "@/shared/lib/displayForm";
import { parseStringList } from "@/shared/lib/parseJson";

import { resolveMnemonic } from "../lib/mnemonicText";
import type { KanjiDetails, KanjiExampleWord, KanjiStrokeData } from "../types";

const STUDIED_EXAMPLE_LIMIT = 5;
const COMMON_EXAMPLE_LIMIT = 3;

type ExampleRow = {
  id: number;
  kanji_text: string | null;
  kana_text: string;
  usually_kana: number | null;
};

// Turns word rows into example words, adding each word's first gloss (one query for all).
async function toExampleWords(db: SQLiteDatabase, rows: ExampleRow[]): Promise<KanjiExampleWord[]> {
  if (rows.length === 0) return [];
  const marks = rows.map(() => "?").join(", ");
  const senses = await db.getAllAsync<{ word_id: number; glosses: string }>(
    `SELECT word_id, glosses FROM content.senses WHERE position = 0 AND word_id IN (${marks})`,
    rows.map((row) => row.id),
  );
  const firstGlossByWord = new Map(
    senses.map((sense) => [sense.word_id, parseStringList(sense.glosses)[0] ?? ""]),
  );
  return rows.map((row) => ({
    id: row.id,
    displayForm: displayForm({
      kanjiText: row.kanji_text,
      kanaText: row.kana_text,
      usuallyKana: row.usually_kana === 1,
    }),
    kana: row.kana_text,
    firstGloss: firstGlossByWord.get(row.id) ?? "",
  }));
}

// Words (shown in kanji, not usually-kana) that the user is learning or already knows.
function loadStudiedWords(db: SQLiteDatabase, char: string): Promise<ExampleRow[]> {
  return db.getAllAsync<ExampleRow>(
    `SELECT w.id, w.kanji_text, w.kana_text, w.usually_kana
     FROM items i JOIN content.words w ON CAST(w.id AS TEXT) = i.item_key
     WHERE i.item_type = 'word' AND i.status IN ('learning', 'known')
       AND COALESCE(w.usually_kana, 0) = 0 AND instr(w.kanji_text, ?) > 0
     ORDER BY (w.study_order IS NULL), w.study_order, w.id
     LIMIT ?`,
    [char, STUDIED_EXAMPLE_LIMIT],
  );
}

// The most common words that contain the kanji (lowest freq_rank first).
function loadCommonWords(db: SQLiteDatabase, char: string): Promise<ExampleRow[]> {
  return db.getAllAsync<ExampleRow>(
    `SELECT id, kanji_text, kana_text, usually_kana FROM content.words
     WHERE COALESCE(usually_kana, 0) = 0 AND instr(kanji_text, ?) > 0
     ORDER BY is_common DESC, (freq_rank IS NULL), freq_rank, id
     LIMIT ?`,
    [char, COMMON_EXAMPLE_LIMIT],
  );
}

async function loadStrokes(db: SQLiteDatabase, char: string): Promise<KanjiStrokeData | null> {
  const row = await db.getFirstAsync<{ view_box: string; paths: string }>(
    "SELECT view_box, paths FROM content.kanji_strokes WHERE kanji = ?",
    [char],
  );
  if (!row) return null;
  return { viewBox: row.view_box, paths: parseStringList(row.paths) };
}

// Everything a kanji card needs. Returns null when the kanji does not exist.
export async function getKanjiDetails(
  db: SQLiteDatabase,
  char: string,
): Promise<KanjiDetails | null> {
  const kanji = await db.getFirstAsync<KanjiRow>("SELECT * FROM content.kanji WHERE char = ?", [
    char,
  ]);
  if (!kanji) return null;

  const components = await db.getAllAsync<{ char: string; name: string }>(
    `SELECT c.char, c.name FROM content.kanji_components kc
     JOIN content.components c ON c.char = kc.component
     WHERE kc.kanji = ? AND kc.component != ? ORDER BY kc.position`,
    [char, char],
  );
  // The user's edit lives in the progress db, the default in the content db.
  const edit = await db.getFirstAsync<{ text: string }>(
    "SELECT text FROM mnemonic_edits WHERE kanji = ?",
    [char],
  );
  const fallback = await db.getFirstAsync<{ text: string }>(
    "SELECT text FROM content.default_mnemonics WHERE kanji = ?",
    [char],
  );
  const mnemonic = resolveMnemonic(edit?.text, fallback?.text);

  // Studied words are the best examples. If there are none, show the most common words.
  const studiedWords = await loadStudiedWords(db, char);
  const examplesAreStudied = studiedWords.length > 0;
  const exampleRows = examplesAreStudied ? studiedWords : await loadCommonWords(db, char);

  return {
    char,
    meanings: parseStringList(kanji.meanings),
    onyomi: parseStringList(kanji.onyomi),
    kunyomi: parseStringList(kanji.kunyomi),
    strokeCount: kanji.strokes,
    jlpt: kanji.jlpt,
    components,
    mnemonic: mnemonic.text,
    isMnemonicEdited: mnemonic.isEdited,
    strokes: await loadStrokes(db, char),
    exampleWords: await toExampleWords(db, exampleRows),
    examplesAreStudied,
  };
}
