import { readFileSync } from "node:fs";
import { assignFrequencyRanks, assignStudyOrder } from "../lib/frequency";
import type { BuiltWord, RawWord } from "../lib/types";
import { assertJmdictFormat } from "../lib/validators";
import { buildWord, isCommonWord } from "../lib/words";
import { findJsonFile } from "./download";

export type WordsResult = {
  words: BuiltWord[];
  // JLPT ids that were not found in JMdict (reported in the summary).
  missingJlptIds: number[];
};

// Reads JMdict and keeps words that are common or listed in a JLPT list.
export function loadWords(jlptLevels: Map<number, number>): WordsResult {
  const data: { words: RawWord[] } = JSON.parse(readFileSync(findJsonFile("jmdict"), "utf8"));
  assertJmdictFormat("jmdict-eng json", data);

  const words: BuiltWord[] = [];
  const foundJlptIds = new Set<number>();
  for (const rawWord of data.words) {
    const id = Number(rawWord.id);
    const jlpt = jlptLevels.get(id) ?? null;
    if (jlpt !== null) foundJlptIds.add(id);
    if (jlpt === null && !isCommonWord(rawWord)) continue;
    words.push(buildWord(rawWord, jlpt));
  }

  const missingJlptIds = [...jlptLevels.keys()].filter((id) => !foundJlptIds.has(id));
  return { words, missingJlptIds };
}

// Fills in freq_rank and study_order once we know how often each word is used.
export function applyRanking(words: BuiltWord[], corpusCounts: Map<number, number>): void {
  const ranks = assignFrequencyRanks(
    words.map((word) => ({
      id: word.id,
      isCommon: word.isCommon,
      corpusCount: corpusCounts.get(word.id) ?? 0,
    })),
  );
  for (const word of words) word.freqRank = ranks.get(word.id) ?? null;

  const order = assignStudyOrder(words);
  for (const word of words) word.studyOrder = order.get(word.id) ?? 0;
}
