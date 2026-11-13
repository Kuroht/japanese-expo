import { kanjiCharsOf, katakanaToHiragana, shouldShowFurigana } from "./furigana";

describe("shouldShowFurigana", () => {
  const unlearned = { hasKanji: true, kanjiAllLearned: false };
  const learned = { hasKanji: true, kanjiAllLearned: true };
  const kanaOnly = { hasKanji: false, kanjiAllLearned: true };

  it("always: shows for any token with kanji", () => {
    expect(shouldShowFurigana(unlearned, "always")).toBe(true);
    expect(shouldShowFurigana(learned, "always")).toBe(true);
    expect(shouldShowFurigana(kanaOnly, "always")).toBe(false);
  });

  it("unlearned: hides once all kanji are learned", () => {
    expect(shouldShowFurigana(unlearned, "unlearned")).toBe(true);
    expect(shouldShowFurigana(learned, "unlearned")).toBe(false);
    expect(shouldShowFurigana(kanaOnly, "unlearned")).toBe(false);
  });

  it("off: never shows", () => {
    expect(shouldShowFurigana(unlearned, "off")).toBe(false);
  });
});

describe("kanjiCharsOf", () => {
  it("picks out kanji only", () => {
    expect(kanjiCharsOf("食べる人")).toEqual(["食", "人"]);
    expect(kanjiCharsOf("ここ")).toEqual([]);
  });
});

describe("katakanaToHiragana", () => {
  it("converts katakana and keeps the long vowel mark", () => {
    expect(katakanaToHiragana("タベル")).toBe("たべる");
    expect(katakanaToHiragana("コーヒー")).toBe("こーひー");
  });
});
