import type { FuriganaMode, PracticeToken } from "../types";

// Decides whether a token gets furigana. "unlearned" hides it once every kanji
// in the token has been learned, so the reader is nudged to recognise the kanji.
export function shouldShowFurigana(
  token: Pick<PracticeToken, "hasKanji" | "kanjiAllLearned">,
  mode: FuriganaMode,
): boolean {
  if (mode === "off") return false;
  if (!token.hasKanji) return false;
  if (mode === "always") return true;
  return !token.kanjiAllLearned;
}

// CJK ideographs plus the iteration mark.
const KANJI_PATTERN = /[㐀-䶿一-鿿々]/u;

// The kanji characters in a piece of text (duplicates kept, order kept).
export function kanjiCharsOf(text: string): string[] {
  return Array.from(text).filter((character) => KANJI_PATTERN.test(character));
}

// Converts katakana to hiragana (the tokenizer gives readings in katakana).
// Only shifts the katakana block, so other characters (like the long vowel mark) stay as they are.
export function katakanaToHiragana(text: string): string {
  return Array.from(text)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;
      const isKatakana = code >= 0x30a1 && code <= 0x30f6;
      return isKatakana ? String.fromCodePoint(code - 0x60) : character;
    })
    .join("");
}
