import { selectSentences } from "./sentenceSelection";

describe("selectSentences", () => {
  it("keeps a sentence only while one of its words needs examples", () => {
    const sentences = [
      { id: 1, length: 3, wordIds: [10] },
      { id: 2, length: 4, wordIds: [10] },
      { id: 3, length: 5, wordIds: [10] },
      { id: 4, length: 6, wordIds: [10, 11] },
    ];
    const kept = selectSentences(sentences, 2).map((sentence) => sentence.id);
    expect(kept).toEqual([1, 2, 4]);
  });
});
