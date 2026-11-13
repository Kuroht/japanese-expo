import type { PrerequisiteLookup } from "../types";
import { expandWithPrerequisites } from "./expandWithPrerequisites";

// A small fake dictionary. 休 = 化 + 木 (木 is a teachable kanji, 化 is not).
const wordKanji: Record<string, string[]> = {
  w1: ["休"],
  w2: ["休", "木"],
  w3: ["木"],
  w4: ["猫"], // not teachable
  w5: [], // usually written in kana
};
const kanjiParts: Record<string, string[]> = {
  休: ["化", "木"],
  木: ["木"],
  日: ["日"],
  明: ["日", "月"],
};
const teachable = new Set(["休", "木", "日", "明"]);

const lookup: PrerequisiteLookup = {
  kanjiOfWord: (wordId) => wordKanji[wordId] ?? [],
  componentsOfKanji: (kanji) => kanjiParts[kanji] ?? [],
  isTeachableKanji: (char) => teachable.has(char),
};
const word = (key: string) => ({ itemType: "word", itemKey: key });
const nothingIntroduced = () => false;
const names = (items: { itemType: string; itemKey: string }[]) =>
  items.map((item) => `${item.itemType}:${item.itemKey}`);

describe("expandWithPrerequisites", () => {
  it("puts components, then the kanji, then the word", () => {
    const result = expandWithPrerequisites([word("w1")], lookup, nothingIntroduced, 20);
    // 木 is itself a teachable kanji, so it becomes a kanji item (not a component item).
    expect(names(result)).toEqual(["component:化", "kanji:木", "kanji:休", "word:w1"]);
  });

  it("skips a component equal to the kanji itself", () => {
    const result = expandWithPrerequisites([word("w3")], lookup, nothingIntroduced, 20);
    expect(names(result)).toEqual(["kanji:木", "word:w3"]);
  });

  it("does not repeat prerequisites inside the batch", () => {
    const result = expandWithPrerequisites([word("w1"), word("w2")], lookup, nothingIntroduced, 20);
    expect(names(result)).toEqual(["component:化", "kanji:木", "kanji:休", "word:w1", "word:w2"]);
  });

  it("skips kanji and components that are already introduced", () => {
    const introduced = (type: string, key: string) =>
      (type === "kanji" && key === "木") || (type === "component" && key === "化");
    const result = expandWithPrerequisites([word("w1")], lookup, introduced, 20);
    expect(names(result)).toEqual(["kanji:休", "word:w1"]);
  });

  it("ignores kanji we do not teach, and words with no kanji", () => {
    const result = expandWithPrerequisites([word("w4"), word("w5")], lookup, nothingIntroduced, 20);
    expect(names(result)).toEqual(["word:w4", "word:w5"]);
  });

  it("passes kana items through untouched", () => {
    const kana = { itemType: "kana", itemKey: "シ" };
    expect(expandWithPrerequisites([kana], lookup, nothingIntroduced, 5)).toEqual([kana]);
  });

  it("never splits a group when trimming to the limit", () => {
    // w1's group has 4 items. With a limit of 4 the w5 word does not fit after it.
    const result = expandWithPrerequisites([word("w1"), word("w5")], lookup, nothingIntroduced, 4);
    expect(names(result)).toEqual(["component:化", "kanji:木", "kanji:休", "word:w1"]);
  });

  it("stops before a group that would go over the limit", () => {
    const result = expandWithPrerequisites([word("w5"), word("w1")], lookup, nothingIntroduced, 3);
    expect(names(result)).toEqual(["word:w5"]);
  });

  it("takes a too-big first group whole when the output is still empty", () => {
    const result = expandWithPrerequisites([word("w1"), word("w5")], lookup, nothingIntroduced, 2);
    expect(names(result)).toEqual(["component:化", "kanji:木", "kanji:休", "word:w1"]);
  });

  it("queues a kanji's own parts first when a component is a teachable kanji", () => {
    const more: PrerequisiteLookup = {
      ...lookup,
      kanjiOfWord: () => ["明"],
    };
    const result = expandWithPrerequisites([word("x")], more, nothingIntroduced, 20);
    // 日 is teachable (kanji item), 月 is a plain component.
    expect(names(result)).toEqual(["kanji:日", "component:月", "kanji:明", "word:x"]);
  });
});
