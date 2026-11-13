import type { ItemRef } from "../types";
import { mixCandidates } from "./mixCandidates";

const kana = (count: number): ItemRef[] =>
  Array.from({ length: count }, (_, index) => ({ itemType: "kana", itemKey: `k${index}` }));
const words = (count: number): ItemRef[] =>
  Array.from({ length: count }, (_, index) => ({ itemType: "word", itemKey: `w${index}` }));
const keys = (items: ItemRef[]) => items.map((item) => item.itemKey);

describe("mixCandidates", () => {
  it("alternates kana and words while basic katakana are not done", () => {
    expect(keys(mixCandidates(kana(3), words(3), 6, false))).toEqual([
      "k0",
      "w0",
      "k1",
      "w1",
      "k2",
      "w2",
    ]);
  });

  it("gives kana 1 slot in 3 once basic katakana are done", () => {
    expect(keys(mixCandidates(kana(5), words(5), 6, true))).toEqual([
      "w0",
      "w1",
      "k0",
      "w2",
      "w3",
      "k1",
    ]);
  });

  it("lets words fill the slots when kana run out", () => {
    expect(keys(mixCandidates(kana(1), words(4), 5, false))).toEqual([
      "k0",
      "w0",
      "w1",
      "w2",
      "w3",
    ]);
  });

  it("lets kana fill the slots when words run out", () => {
    expect(keys(mixCandidates(kana(4), words(1), 5, true))).toEqual(["w0", "k0", "k1", "k2", "k3"]);
  });

  it("respects the limit and handles empty lists", () => {
    expect(mixCandidates(kana(5), words(5), 3, false)).toHaveLength(3);
    expect(mixCandidates([], [], 5, true)).toEqual([]);
    expect(mixCandidates(kana(2), words(2), 0, true)).toEqual([]);
  });
});
