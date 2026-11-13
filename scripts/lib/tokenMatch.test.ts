import { buildWordIndex, findWordId } from "./tokenMatch";

const index = buildWordIndex([
  { candidate: { id: 1, hasJlpt: false, isCommon: true, order: 1 }, forms: ["橋", "はし"] },
  { candidate: { id: 2, hasJlpt: true, isCommon: false, order: 5 }, forms: ["箸", "はし"] },
  { candidate: { id: 3, hasJlpt: false, isCommon: true, order: 2 }, forms: ["食べる", "たべる"] },
]);

describe("findWordId", () => {
  it("matches the base form on a kanji form", () => {
    expect(findWordId(index, "食べる", "食べ", "動詞")).toBe(3);
  });

  it("prefers a JLPT word when several words share a kana form", () => {
    expect(findWordId(index, "はし", "はし", "名詞")).toBe(2);
  });

  it("falls back to the surface when the base form is unknown", () => {
    expect(findWordId(index, "*", "橋", "名詞")).toBe(1);
  });

  it("returns null for punctuation and unknown words", () => {
    expect(findWordId(index, "。", "。", "記号")).toBeNull();
    expect(findWordId(index, "ほげ", "ほげ", "名詞")).toBeNull();
  });

  it("never links particles or auxiliary verbs, even when JMdict has them", () => {
    const particleIndex = buildWordIndex([
      { candidate: { id: 9, hasJlpt: true, isCommon: true, order: 1 }, forms: ["は", "だ"] },
    ]);
    expect(findWordId(particleIndex, "は", "は", "助詞")).toBeNull();
    expect(findWordId(particleIndex, "だ", "だ", "助動詞")).toBeNull();
  });
});
