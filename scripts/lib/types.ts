// Shapes of the raw source files (only the fields we read) and of the rows we build.

// ---- jmdict-simplified: jmdict-eng ----
export type RawKanjiForm = { common: boolean; text: string; tags: string[] };
export type RawKanaForm = {
  common: boolean;
  text: string;
  tags: string[];
  appliesToKanji: string[];
};
export type RawSense = {
  partOfSpeech: string[];
  misc: string[];
  gloss: { text: string }[];
};
export type RawWord = {
  id: string;
  kanji: RawKanjiForm[];
  kana: RawKanaForm[];
  sense: RawSense[];
};

// ---- jmdict-simplified: kanjidic2 ----
export type RawKanjidicCharacter = {
  literal: string;
  misc: {
    grade: number | null;
    strokeCounts: number[];
    frequency: number | null;
  };
  readingMeaning: {
    groups: {
      readings: { type: string; value: string }[];
      meanings: { lang: string; value: string }[];
    }[];
  } | null;
};

// ---- rows we write to the content DB ----
export type WordForm = {
  text: string;
  kind: "kanji" | "kana";
  isCommon: boolean;
  // False for search-only, rare, irregular or outdated spellings (sK, rK, iK, oK tags).
  isUsual: boolean;
};

export type BuiltSense = {
  pos: string[];
  glosses: string[];
  misc: string[];
};

export type BuiltWord = {
  id: number;
  jlpt: number | null;
  freqRank: number | null;
  isCommon: boolean;
  kanjiText: string | null;
  kanaText: string;
  romaji: string;
  furigana: string; // JSON text
  studyOrder: number;
  forms: WordForm[];
  senses: BuiltSense[];
};

export type KanjiRow = {
  char: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  strokes: number | null;
  grade: number | null;
  freq: number | null;
  jlpt: number | null;
};

export type ComponentRow = {
  char: string;
  name: string;
  source: "kangxi" | "custom";
  strokes: number | null;
};

export type KanjiComponentRow = {
  kanji: string;
  component: string;
  position: number;
};

export type KanjiStrokesRow = {
  kanji: string;
  viewBox: string;
  paths: string[];
};

export type SentenceToken = {
  surface: string;
  reading: string;
  baseForm: string;
  wordId: number | null;
};

export type SentenceRow = {
  id: number;
  japanese: string;
  english: string;
  length: number;
  furigana: string; // JSON text
  tokens: SentenceToken[];
  wordIds: number[];
};
