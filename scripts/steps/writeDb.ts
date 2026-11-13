import { DatabaseSync, type StatementSync } from "node:sqlite";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { CONTENT_VERSION, SOURCE_VERSIONS } from "../sources";
import type {
  BuiltWord,
  ComponentRow,
  KanjiComponentRow,
  KanjiRow,
  KanjiStrokesRow,
  MnemonicRow,
  SentenceRow,
} from "../lib/types";

const ROOT_FOLDER = path.join(__dirname, "..", "..");
const ASSETS_FOLDER = path.join(ROOT_FOLDER, "assets");
const VERSION_FILE = path.join(ROOT_FOLDER, "src", "shared", "db", "contentVersion.ts");
const ASSET_FILE = path.join(ROOT_FOLDER, "src", "shared", "db", "contentAsset.ts");

// Everything the DB needs. Built by the earlier steps.
export type ContentData = {
  words: BuiltWord[];
  kanji: KanjiRow[];
  components: ComponentRow[];
  kanjiComponents: KanjiComponentRow[];
  strokes: KanjiStrokesRow[];
  mnemonics: MnemonicRow[];
  sentences: SentenceRow[];
};

// Table layout, exactly as in the plan (section 3). Some tables also get a primary key.
const SCHEMA = `
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE words (
  id INTEGER PRIMARY KEY,
  jlpt INTEGER, freq_rank INTEGER, is_common INTEGER,
  kanji_text TEXT, kana_text TEXT, romaji TEXT,
  furigana TEXT,
  study_order INTEGER,
  usually_kana INTEGER
);
CREATE TABLE word_forms (word_id INTEGER, text TEXT, kind TEXT, is_common INTEGER, position INTEGER);
CREATE TABLE senses (word_id INTEGER, position INTEGER, pos TEXT, glosses TEXT, misc TEXT);
CREATE VIRTUAL TABLE glosses_fts USING fts5(word_id UNINDEXED, gloss);
CREATE TABLE kanji (
  char TEXT PRIMARY KEY, meanings TEXT, onyomi TEXT, kunyomi TEXT,
  strokes INTEGER, grade INTEGER, freq INTEGER, jlpt INTEGER
);
CREATE TABLE components (char TEXT PRIMARY KEY, name TEXT, source TEXT, strokes INTEGER);
CREATE TABLE kanji_components (kanji TEXT, component TEXT, position INTEGER);
CREATE TABLE kanji_strokes (kanji TEXT PRIMARY KEY, view_box TEXT, paths TEXT);
CREATE TABLE default_mnemonics (kanji TEXT PRIMARY KEY, text TEXT);
CREATE TABLE sentences (id INTEGER PRIMARY KEY, japanese TEXT, english TEXT, length INTEGER, furigana TEXT);
CREATE TABLE sentence_tokens (
  sentence_id INTEGER, position INTEGER, surface TEXT, reading TEXT, base_form TEXT, word_id INTEGER,
  PRIMARY KEY (sentence_id, position)
) WITHOUT ROWID;
CREATE TABLE sentence_words (
  sentence_id INTEGER, word_id INTEGER, PRIMARY KEY (word_id, sentence_id)
) WITHOUT ROWID;
`;

// Indexes are created after the data is inserted, which is faster.
const INDEXES = `
CREATE INDEX idx_words_study_order ON words(study_order);
CREATE INDEX idx_words_jlpt ON words(jlpt);
CREATE INDEX idx_word_forms_text ON word_forms(text);
CREATE INDEX idx_word_forms_word_id ON word_forms(word_id);
CREATE INDEX idx_senses_word_id ON senses(word_id);
CREATE INDEX idx_kanji_components_kanji ON kanji_components(kanji);
CREATE INDEX idx_kanji_components_component ON kanji_components(component);
CREATE INDEX idx_sentence_words_sentence_id ON sentence_words(sentence_id);
`;

// Runs "insertAll" inside one transaction (much faster than one per row).
function inTransaction(database: DatabaseSync, insertAll: () => void): void {
  database.exec("BEGIN");
  insertAll();
  database.exec("COMMIT");
}

function insertWords(database: DatabaseSync, words: BuiltWord[]): void {
  const insertWord = database.prepare("INSERT INTO words VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insertForm = database.prepare("INSERT INTO word_forms VALUES (?, ?, ?, ?, ?)");
  const insertSense = database.prepare("INSERT INTO senses VALUES (?, ?, ?, ?, ?)");
  const insertGloss = database.prepare("INSERT INTO glosses_fts (word_id, gloss) VALUES (?, ?)");

  inTransaction(database, () => {
    for (const word of words) {
      insertWord.run(
        word.id,
        word.jlpt,
        word.freqRank,
        word.isCommon ? 1 : 0,
        word.kanjiText,
        word.kanaText,
        word.romaji,
        word.furigana,
        word.studyOrder,
        word.usuallyKana ? 1 : 0,
      );
      word.forms.forEach((form, position) =>
        insertForm.run(word.id, form.text, form.kind, form.isCommon ? 1 : 0, position),
      );
      word.senses.forEach((sense, position) => {
        insertSense.run(
          word.id,
          position,
          JSON.stringify(sense.pos),
          JSON.stringify(sense.glosses),
          JSON.stringify(sense.misc),
        );
        // One search row per gloss, so short exact glosses can rank first.
        for (const gloss of sense.glosses) insertGloss.run(word.id, gloss);
      });
    }
  });
}

function insertKanjiTables(database: DatabaseSync, data: ContentData): void {
  const insertKanji = database.prepare("INSERT INTO kanji VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const insertComponent = database.prepare("INSERT INTO components VALUES (?, ?, ?, ?)");
  const insertKanjiComponent = database.prepare("INSERT INTO kanji_components VALUES (?, ?, ?)");
  const insertStrokes = database.prepare("INSERT INTO kanji_strokes VALUES (?, ?, ?)");
  const insertMnemonic = database.prepare("INSERT INTO default_mnemonics VALUES (?, ?)");

  inTransaction(database, () => {
    for (const row of data.kanji) {
      insertKanji.run(
        row.char,
        JSON.stringify(row.meanings),
        JSON.stringify(row.onyomi),
        JSON.stringify(row.kunyomi),
        row.strokes,
        row.grade,
        row.freq,
        row.jlpt,
      );
    }
    for (const row of data.components)
      insertComponent.run(row.char, row.name, row.source, row.strokes);
    for (const row of data.kanjiComponents)
      insertKanjiComponent.run(row.kanji, row.component, row.position);
    for (const row of data.strokes)
      insertStrokes.run(row.kanji, row.viewBox, JSON.stringify(row.paths));
    for (const row of data.mnemonics) insertMnemonic.run(row.kanji, row.text);
  });
}

function insertSentenceTables(database: DatabaseSync, sentences: SentenceRow[]): void {
  const insertSentence = database.prepare("INSERT INTO sentences VALUES (?, ?, ?, ?, ?)");
  const insertToken = database.prepare("INSERT INTO sentence_tokens VALUES (?, ?, ?, ?, ?, ?)");
  const insertWord = database.prepare("INSERT INTO sentence_words VALUES (?, ?)");

  inTransaction(database, () => {
    for (const sentence of sentences) {
      insertSentence.run(
        sentence.id,
        sentence.japanese,
        sentence.english,
        sentence.length,
        sentence.furigana,
      );
      sentence.tokens.forEach((token, position) =>
        insertToken.run(
          sentence.id,
          position,
          token.surface,
          token.reading,
          token.baseForm,
          token.wordId,
        ),
      );
      for (const wordId of sentence.wordIds) insertWord.run(sentence.id, wordId);
    }
  });
}

function insertMeta(database: DatabaseSync): void {
  const insertRow: StatementSync = database.prepare("INSERT INTO meta VALUES (?, ?)");
  insertRow.run("content_version", String(CONTENT_VERSION));
  insertRow.run("built_at", new Date().toISOString());
  for (const [name, version] of Object.entries(SOURCE_VERSIONS)) {
    insertRow.run(`source_${name}`, version);
  }
}

// Removes every older assets/content-v*.db file. Runs only after the new one is complete.
function deleteOldContentFiles(keepFileName: string): void {
  for (const fileName of readdirSync(ASSETS_FOLDER)) {
    if (fileName === keepFileName) continue;
    if (/^content-v\d+\.db(-journal|-wal|-shm|\.tmp)?$/.test(fileName)) {
      rmSync(path.join(ASSETS_FOLDER, fileName));
    }
  }
}

// Writes contentVersion.ts and contentAsset.ts so the app opens the matching file.
// Both are generated together, so the version number and the bundled file never disagree.
// contentAsset.ts needs a literal require() path because Metro can't follow a variable.
function writeVersionFiles(): void {
  const header = [
    "// GENERATED by scripts/build-content.ts. Do not edit by hand.",
    "// To change it, bump CONTENT_VERSION in scripts/sources.ts and rebuild.",
  ];
  const versionLines = [...header, `export const CONTENT_VERSION = ${CONTENT_VERSION};`, ""];
  const assetLines = [
    ...header,
    "// The bundled content database that installContentDb copies onto the phone.",
    `export const contentAsset: number = require("../../../assets/content-v${CONTENT_VERSION}.db");`,
    "",
  ];
  mkdirSync(path.dirname(VERSION_FILE), { recursive: true });
  writeFileSync(VERSION_FILE, versionLines.join("\n"));
  writeFileSync(ASSET_FILE, assetLines.join("\n"));
}

// Creates assets/content-v{N}.db from scratch and returns its path.
export function writeDatabase(data: ContentData): string {
  mkdirSync(ASSETS_FOLDER, { recursive: true });
  const fileName = `content-v${CONTENT_VERSION}.db`;
  const databasePath = path.join(ASSETS_FOLDER, fileName);
  // Build into a .tmp file first, so a crash mid-build never leaves a broken asset behind.
  const temporaryPath = `${databasePath}.tmp`;
  if (existsSync(temporaryPath)) rmSync(temporaryPath);

  const database = new DatabaseSync(temporaryPath);
  database.exec(SCHEMA);
  insertWords(database, data.words);
  insertKanjiTables(database, data);
  insertSentenceTables(database, data.sentences);
  insertMeta(database);
  database.exec(INDEXES);
  database.exec("INSERT INTO glosses_fts(glosses_fts) VALUES ('optimize')");
  database.exec("VACUUM");
  database.close();

  if (existsSync(databasePath)) rmSync(databasePath);
  renameSync(temporaryPath, databasePath);
  deleteOldContentFiles(fileName);
  writeVersionFiles();
  return databasePath;
}

// Counts rows in each table and reports the file size.
export function printSummary(databasePath: string): void {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const tables = [
    "words",
    "word_forms",
    "senses",
    "glosses_fts",
    "kanji",
    "components",
    "kanji_components",
    "kanji_strokes",
    "default_mnemonics",
    "sentences",
    "sentence_tokens",
    "sentence_words",
    "meta",
  ];
  console.log("\nRow counts:");
  for (const table of tables) {
    const row = database.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get() as {
      total: number;
    };
    console.log(`  ${table.padEnd(18)} ${row.total}`);
  }
  database.close();

  const megabytes = statSync(databasePath).size / (1024 * 1024);
  console.log(`\nDB file: ${databasePath}`);
  console.log(`DB size: ${megabytes.toFixed(1)} MB`);
}
