// How furigana (small hiragana above kanji) is shown while reading.
export type FuriganaMode = "always" | "unlearned" | "off";

export type ReadingSettings = {
  furiganaMode: FuriganaMode;
  // Playback speed for shadowing (repeating after the audio). 1 = normal speed.
  shadowingRate: number;
};

// One sentence offered for reading practice.
export type PracticeSentenceSummary = {
  id: number;
  japanese: string;
  english: string;
  unknownCount: number;
};

// One word-sized piece of a sentence, with what the reader needs to know about it.
export type PracticeToken = {
  surface: string;
  reading: string; // hiragana
  wordId: number | null;
  isKnownWord: boolean;
  hasKanji: boolean;
  kanjiAllLearned: boolean;
  displayForm?: string;
  firstGloss?: string;
};

export type PracticeSentence = {
  id: number;
  japanese: string;
  english: string;
  tokens: PracticeToken[];
};
