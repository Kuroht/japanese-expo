import {
  ALL_KANA_ENTRIES,
  BASIC_KATAKANA_COUNT,
  HIRAGANA_ENTRIES,
  KATAKANA_ENTRIES,
} from "../data/kanaData";
import type { KanaItemRef } from "../types";

const KATAKANA_PER_HIRAGANA = 2;
const KANA_PER_LOANWORD = 2;

// The full kana teaching order: katakana in group order, with 1 hiragana after every
// 2 katakana (so the quick hiragana review runs alongside). Leftover hiragana come last.
export function orderedKanaKeys(): string[] {
  const hiragana = HIRAGANA_ENTRIES.map((entry) => entry.kana);
  const keys: string[] = [];
  KATAKANA_ENTRIES.forEach((entry, index) => {
    keys.push(entry.kana);
    const isEndOfPair = (index + 1) % KATAKANA_PER_HIRAGANA === 0;
    const nextHiragana = isEndOfPair ? hiragana.shift() : undefined;
    if (nextHiragana) keys.push(nextHiragana);
  });
  return [...keys, ...hiragana];
}

type PickInput = {
  isIntroduced: (itemType: string, itemKey: string) => boolean;
  loanwordIds: string[]; // already in study order
  limit: number;
};

// Chooses the next items to teach (pure, so it can be tested without a database).
// Kana come in teaching order. Once ALL basic katakana are introduced, loanwords join:
// 1 loanword after every 2 kana, and only loanwords once the kana run out.
export function pickCandidates({ isIntroduced, loanwordIds, limit }: PickInput): KanaItemRef[] {
  const kanaLeft = orderedKanaKeys().filter((key) => !isIntroduced("kana", key));
  const loanwordsLeft = loanwordIds.filter((id) => !isIntroduced("loanword", id));
  const basicKatakanaKeys = ALL_KANA_ENTRIES.slice(0, BASIC_KATAKANA_COUNT).map((e) => e.kana);

  const picked: KanaItemRef[] = [];
  let kanaSinceLoanword = 0;
  while (picked.length < limit && (kanaLeft.length > 0 || loanwordsLeft.length > 0)) {
    const stillLearningBasics = basicKatakanaKeys.some((key) => kanaLeft.includes(key));
    const loanwordsOpen = !stillLearningBasics && loanwordsLeft.length > 0;
    const loanwordTurn =
      loanwordsOpen && (kanaLeft.length === 0 || kanaSinceLoanword >= KANA_PER_LOANWORD);
    if (loanwordTurn) {
      picked.push({ itemType: "loanword", itemKey: loanwordsLeft.shift() as string });
      kanaSinceLoanword = 0;
    } else if (kanaLeft.length > 0) {
      picked.push({ itemType: "kana", itemKey: kanaLeft.shift() as string });
      kanaSinceLoanword += 1;
    } else {
      break;
    }
  }
  return picked;
}
