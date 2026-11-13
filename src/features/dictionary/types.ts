import type { FuriganaSegment } from "@/shared/db/types";

// One row in the search results list.
export type WordSearchResult = {
  id: number;
  kanjiText: string | null;
  kanaText: string;
  usuallyKana: boolean;
  jlpt: number | null;
  isCommon: boolean;
  firstGlosses: string[];
};

export type WordForm = {
  text: string;
  kind: "kanji" | "kana";
  isCommon: boolean;
};

// One numbered meaning of a word, with its parts of speech (noun, verb…).
export type WordSense = {
  partsOfSpeech: string[];
  glosses: string[];
};

export type ExampleSentence = {
  id: number;
  japanese: string;
  english: string;
  furigana: FuriganaSegment[];
};

// Everything the word detail screen shows.
export type WordDetail = {
  id: number;
  jlpt: number | null;
  isCommon: boolean;
  kanaText: string;
  furigana: FuriganaSegment[];
  forms: WordForm[];
  senses: WordSense[];
  sentences: ExampleSentence[];
};

// What a data hook returns: show a spinner, an error, or the data.
export type LoadState<T> = {
  isLoading: boolean;
  errorMessage: string | null;
  data: T | null;
};
