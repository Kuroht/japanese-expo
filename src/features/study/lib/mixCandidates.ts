import type { ItemRef } from "../types";

// While basic katakana are still being learned: kana, word, kana, word ...
// Afterwards: word, word, kana (kana and loanwords get 1 slot in 3).
// Words matter most, and the learner already reads hiragana.
const KANA_SLOTS_LEARNING_BASICS = [true, false];
const KANA_SLOTS_AFTER_BASICS = [false, false, true];

// Mixes the kana provider's list and the word provider's list into one teaching order.
// When one list runs out, the other fills the remaining slots. Pure, so it is easy to test.
export function mixCandidates(
  kanaList: ItemRef[],
  wordList: ItemRef[],
  limit: number,
  basicKatakanaDone: boolean,
): ItemRef[] {
  const pattern = basicKatakanaDone ? KANA_SLOTS_AFTER_BASICS : KANA_SLOTS_LEARNING_BASICS;
  const kanaLeft = [...kanaList];
  const wordsLeft = [...wordList];
  const mixed: ItemRef[] = [];

  for (let slot = 0; mixed.length < limit; slot += 1) {
    if (kanaLeft.length === 0 && wordsLeft.length === 0) break;
    const wantsKana = pattern[slot % pattern.length];
    // Take from the wanted list, or from the other one when the wanted list is empty.
    const useKana = wantsKana ? kanaLeft.length > 0 : wordsLeft.length === 0;
    const next = useKana ? kanaLeft.shift() : wordsLeft.shift();
    if (next) mixed.push(next);
  }
  return mixed;
}
