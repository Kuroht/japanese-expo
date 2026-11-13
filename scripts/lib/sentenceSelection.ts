// Picks which sentences to keep so each word has at most a few examples.
export type SelectableSentence = {
  id: number;
  length: number;
  wordIds: number[];
};

// Goes through sentences from shortest to longest and keeps one if any of its
// words still has fewer than "maxPerWord" examples. Returns the kept ids.
export function selectSentences<T extends SelectableSentence>(
  sentences: T[],
  maxPerWord: number,
): T[] {
  const sorted = [...sentences].sort(
    (first, second) => first.length - second.length || first.id - second.id,
  );
  const exampleCounts = new Map<number, number>();
  const kept: T[] = [];

  for (const sentence of sorted) {
    const needsExamples = sentence.wordIds.some(
      (wordId) => (exampleCounts.get(wordId) ?? 0) < maxPerWord,
    );
    if (!needsExamples) continue;

    kept.push(sentence);
    for (const wordId of sentence.wordIds) {
      exampleCounts.set(wordId, (exampleCounts.get(wordId) ?? 0) + 1);
    }
  }
  return kept;
}
