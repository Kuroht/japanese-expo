// A kept word that a sentence token might point to.
export type MatchCandidate = {
  id: number;
  hasJlpt: boolean;
  isCommon: boolean;
  // Lower = studied earlier. Used as the last tie-breaker.
  order: number;
};

export type WordIndex = Map<string, MatchCandidate>;

// True when "first" is a better match than "second":
// JLPT words win, then common words, then the lowest study order.
function isBetterCandidate(first: MatchCandidate, second: MatchCandidate): boolean {
  if (first.hasJlpt !== second.hasJlpt) return first.hasJlpt;
  if (first.isCommon !== second.isCommon) return first.isCommon;
  return first.order < second.order;
}

// Builds a lookup from written text (kanji or kana form) to the best word for it.
export function buildWordIndex(
  entries: { candidate: MatchCandidate; forms: string[] }[],
): WordIndex {
  const index: WordIndex = new Map();
  for (const { candidate, forms } of entries) {
    for (const text of forms) {
      const existing = index.get(text);
      if (!existing || isBetterCandidate(candidate, existing)) {
        index.set(text, candidate);
      }
    }
  }
  return index;
}

// Parts of speech we never link to a word: punctuation (記号), particles (助詞) and
// auxiliary verbs (助動詞). Particles like は or の would otherwise match JMdict kana
// entries, dominate the frequency ranking and appear as "example sentences" everywhere.
const SKIPPED_PARTS_OF_SPEECH = ["記号", "助詞", "助動詞"];

// Finds the word id for a kuromoji token. Tries the dictionary form first, then the surface.
// Returns null for skipped parts of speech and anything we do not have a word for.
export function findWordId(
  index: WordIndex,
  baseForm: string,
  surface: string,
  partOfSpeech: string,
): number | null {
  if (SKIPPED_PARTS_OF_SPEECH.includes(partOfSpeech)) return null;
  const match = index.get(baseForm) ?? index.get(surface);
  return match ? match.id : null;
}
