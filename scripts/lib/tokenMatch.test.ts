import { buildWordIndex, findWordId } from "./tokenMatch";

// Helpers so each test row stays on one line.
const primary = (text: string) => ({ text, isPrimaryForm: true });
const secondary = (text: string) => ({ text, isPrimaryForm: false });

const index = buildWordIndex([
  {
    candidate: { id: 1, hasJlpt: false, isCommon: true, order: 1 },
    forms: [primary("橋"), secondary("はし")],
  },
  {
    candidate: { id: 2, hasJlpt: true, isCommon: false, order: 5 },
    forms: [primary("箸"), secondary("はし")],
  },
  {
    candidate: { id: 3, hasJlpt: false, isCommon: true, order: 2 },
    forms: [primary("食べる"), secondary("たべる")],
  },
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
      {
        candidate: { id: 9, hasJlpt: true, isCommon: true, order: 1 },
        forms: [primary("は"), primary("だ")],
      },
    ]);
    expect(findWordId(particleIndex, "は", "は", "助詞")).toBeNull();
    expect(findWordId(particleIndex, "だ", "だ", "助動詞")).toBeNull();
  });

  it("prefers the word whose primary form is the kana over a kanji word's secondary reading", () => {
    // 九 (JLPT, common) lists ここ as a reading, but ここ (here) is written ここ.
    const kanaIndex = buildWordIndex([
      {
        candidate: { id: 10, hasJlpt: true, isCommon: true, order: 1 },
        forms: [primary("九"), secondary("ここ")],
      },
      {
        candidate: { id: 11, hasJlpt: false, isCommon: true, order: 50 },
        forms: [primary("ここ")],
      },
    ]);
    expect(findWordId(kanaIndex, "ここ", "ここ", "名詞")).toBe(11);
    expect(findWordId(kanaIndex, "九", "九", "名詞")).toBe(10);
  });

  it("is not affected by the order the words are added in", () => {
    const entries = [
      {
        candidate: { id: 11, hasJlpt: false, isCommon: true, order: 50 },
        forms: [primary("え")],
      },
      {
        candidate: { id: 10, hasJlpt: true, isCommon: true, order: 1 },
        forms: [primary("絵"), secondary("え")],
      },
    ];
    expect(findWordId(buildWordIndex(entries), "え", "え", "名詞")).toBe(11);
    expect(findWordId(buildWordIndex([...entries].reverse()), "え", "え", "名詞")).toBe(11);
  });
});
