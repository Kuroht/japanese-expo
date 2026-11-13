import { assignFrequencyRanks, assignStudyOrder } from "./frequency";

describe("assignFrequencyRanks", () => {
  it("ranks by corpus count, then common, then id", () => {
    const ranks = assignFrequencyRanks([
      { id: 1, isCommon: false, corpusCount: 5 },
      { id: 2, isCommon: true, corpusCount: 5 },
      { id: 3, isCommon: false, corpusCount: 50 },
      { id: 4, isCommon: false, corpusCount: 5 },
    ]);
    expect(ranks.get(3)).toBe(1);
    expect(ranks.get(2)).toBe(2);
    expect(ranks.get(1)).toBe(3);
    expect(ranks.get(4)).toBe(4);
  });
});

describe("assignStudyOrder", () => {
  it("puts N5 first, then N4, then non-JLPT words by rank", () => {
    const order = assignStudyOrder([
      { id: 1, jlpt: null, freqRank: 1 },
      { id: 2, jlpt: 4, freqRank: 9 },
      { id: 3, jlpt: 5, freqRank: 20 },
      { id: 4, jlpt: 5, freqRank: 10 },
    ]);
    expect(order.get(4)).toBe(1);
    expect(order.get(3)).toBe(2);
    expect(order.get(2)).toBe(3);
    expect(order.get(1)).toBe(4);
  });
});
