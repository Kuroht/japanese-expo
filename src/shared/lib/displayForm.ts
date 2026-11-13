import type { FuriganaSegment } from "@/shared/db/types";

// The parts of a word row that decide how the word is written on screen.
export type DisplayableWord = {
  kanjiText: string | null;
  kanaText: string;
  usuallyKana: boolean;
};

// The headword to show. Words JMdict marks "usually written in kana" (uk) show their kana,
// because the kanji is rare and would only confuse a learner. kanji_text stays in the DB.
export function displayForm(word: DisplayableWord): string {
  if (word.kanjiText === null || word.usuallyKana) return word.kanaText;
  return word.kanjiText;
}

// The furigana segments for the headword. Kana headwords need no furigana.
export function displayFurigana(
  word: DisplayableWord,
  parsedFurigana: FuriganaSegment[],
): FuriganaSegment[] {
  if (word.kanjiText === null || word.usuallyKana) return [{ text: word.kanaText }];
  return parsedFurigana;
}
