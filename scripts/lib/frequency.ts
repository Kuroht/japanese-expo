// jmdict-simplified only tells us "common: true/false", not the nfXX priority tags.
// So we rank words by how often they appear in our Tatoeba sentences instead.
// Words that are common come first when the counts are tied, then lower id.
export type RankInput = { id: number; isCommon: boolean; corpusCount: number };

// Returns a map of word id -> rank (1 = most frequent).
export function assignFrequencyRanks(words: RankInput[]): Map<number, number> {
  const sorted = [...words].sort((first, second) => {
    if (first.corpusCount !== second.corpusCount) {
      return second.corpusCount - first.corpusCount;
    }
    if (first.isCommon !== second.isCommon) return first.isCommon ? -1 : 1;
    return first.id - second.id;
  });

  const ranks = new Map<number, number>();
  sorted.forEach((word, index) => ranks.set(word.id, index + 1));
  return ranks;
}

export type OrderInput = {
  id: number;
  jlpt: number | null;
  freqRank: number | null;
};

// Returns a map of word id -> study order (1 = learn first).
// JLPT words first (N5, then N4, ...), then by frequency rank, then by id.
export function assignStudyOrder(words: OrderInput[]): Map<number, number> {
  const sorted = [...words].sort((first, second) => {
    // Words without a JLPT level count as level 0, so they sort after N1.
    const firstLevel = first.jlpt ?? 0;
    const secondLevel = second.jlpt ?? 0;
    if (firstLevel !== secondLevel) return secondLevel - firstLevel;
    const firstRank = first.freqRank ?? Number.MAX_SAFE_INTEGER;
    const secondRank = second.freqRank ?? Number.MAX_SAFE_INTEGER;
    if (firstRank !== secondRank) return firstRank - secondRank;
    return first.id - second.id;
  });

  const order = new Map<number, number>();
  sorted.forEach((word, index) => order.set(word.id, index + 1));
  return order;
}
