// Row types for the content database (attached as "content"). They match the
// column names in the pipeline schema. JSON columns arrive as strings.
export type WordRow = {
  id: number;
  jlpt: number | null;
  freq_rank: number | null;
  is_common: number;
  kanji_text: string | null;
  kana_text: string;
  romaji: string | null;
  furigana: string | null; // JSON FuriganaSegment[]
  study_order: number | null;
};

export type WordFormRow = {
  word_id: number;
  text: string;
  kind: "kanji" | "kana";
  is_common: number;
  position: number;
};

export type SenseRow = {
  word_id: number;
  position: number;
  pos: string; // JSON string[]
  glosses: string; // JSON string[]
  misc: string; // JSON string[]
};

export type SentenceRow = {
  id: number;
  japanese: string;
  english: string;
  length: number;
  furigana: string | null; // JSON FuriganaSegment[]
};

export type KanjiRow = {
  char: string;
  meanings: string; // JSON string[]
  onyomi: string; // JSON string[]
  kunyomi: string; // JSON string[]
  strokes: number | null;
  grade: number | null;
  freq: number | null;
  jlpt: number | null;
};

// One piece of a furigana word: the text, plus its reading if it is kanji.
export type FuriganaSegment = {
  text: string;
  reading?: string;
};
