import type { FuriganaSegment } from "@/shared/db/types";

// What a word study card and its intro screen need.
export type WordStudyDetails = {
  id: number;
  displayForm: string; // headword: kana for usually-kana words
  kanaText: string;
  kanjiText: string | null;
  furigana: FuriganaSegment[]; // for the headword
  romaji: string | null;
  jlpt: number | null;
  partsOfSpeech: string[]; // of the first sense
  glosses: string[]; // one line per sense, first 3 senses
  sentences: WordExample[];
};

export type WordExample = {
  id: number;
  japanese: string;
  english: string;
  furigana: FuriganaSegment[];
};

// What a word item provider hands to the study engine (matches study's ItemRef).
export type WordItemRef = { itemType: "word"; itemKey: string };

// null = not started. 'suspended' items show as null too (the list only cares about known).
export type VocabStatus = "learning" | "known" | null;

// One row of the "mark words I know" list.
export type VocabListRow = {
  id: number;
  displayForm: string;
  kanaText: string;
  firstGlosses: string[];
  jlpt: number | null;
  status: VocabStatus;
};

export type VocabListOptions = {
  jlpt: number | null; // null = N5 and N4 (the levels we teach)
  search: string;
  offset: number;
  limit: number;
};
