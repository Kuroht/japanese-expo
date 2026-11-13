import type { KanaEntry } from "../types";
import { hiraganaBasic, hiraganaCombos, hiraganaDakuten } from "./hiraganaData";
import {
  katakanaBasic,
  katakanaCombos,
  katakanaDakuten,
  katakanaExtended,
  katakanaLongVowel,
  katakanaSmallTsu,
} from "./katakanaData";

// Katakana in teaching order (group by group).
export const KATAKANA_ENTRIES: KanaEntry[] = [
  ...katakanaBasic,
  ...katakanaDakuten,
  ...katakanaCombos,
  ...katakanaSmallTsu,
  ...katakanaLongVowel,
  ...katakanaExtended,
];

// Hiragana in teaching order. It is only a quick review set.
export const HIRAGANA_ENTRIES: KanaEntry[] = [
  ...hiraganaBasic,
  ...hiraganaDakuten,
  ...hiraganaCombos,
];

export const ALL_KANA_ENTRIES: KanaEntry[] = [...KATAKANA_ENTRIES, ...HIRAGANA_ENTRIES];

export const BASIC_KATAKANA_COUNT = katakanaBasic.length;

// Finds the entry for a kana text such as "シ" or "ッカ" (undefined if unknown).
export function findKanaEntry(kana: string): KanaEntry | undefined {
  return ALL_KANA_ENTRIES.find((entry) => entry.kana === kana);
}
