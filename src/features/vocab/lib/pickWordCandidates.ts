import { isKatakana } from "wanakana";

import type { WordItemRef } from "../types";

// The few word columns needed to decide what to teach.
export type WordCandidateRow = {
  id: number;
  jlpt: number | null;
  study_order: number | null;
  kanji_text: string | null;
  kana_text: string;
};

// Loanwords are taught by the kana feature (kana_text all katakana, no kanji, 3+ characters).
// This must match the kana feature's rule, so no word is taught twice or dropped.
function isLoanword(row: WordCandidateRow): boolean {
  return row.kanji_text === null && row.kana_text.length >= 3 && isKatakana(row.kana_text);
}

// Chooses the next words to teach: N5 first, then N4, each by study order.
// Pure, so it is tested without a database.
export function pickWordCandidates(
  rows: WordCandidateRow[],
  isIntroduced: (itemType: string, itemKey: string) => boolean,
  limit: number,
): WordItemRef[] {
  const orderOf = (row: WordCandidateRow) => row.study_order ?? Number.MAX_SAFE_INTEGER;
  return rows
    .filter((row) => row.jlpt === 5 || row.jlpt === 4)
    .filter((row) => !isLoanword(row))
    .filter((row) => !isIntroduced("word", String(row.id)))
    .sort((a, b) => (b.jlpt ?? 0) - (a.jlpt ?? 0) || orderOf(a) - orderOf(b) || a.id - b.id)
    .slice(0, limit)
    .map((row) => ({ itemType: "word", itemKey: String(row.id) }));
}
