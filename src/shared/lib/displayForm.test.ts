import { displayForm, displayFurigana } from "./displayForm";

describe("displayForm", () => {
  it("shows the kanji for a normal kanji word", () => {
    expect(displayForm({ kanjiText: "食べる", kanaText: "たべる", usuallyKana: false })).toBe(
      "食べる",
    );
  });

  it("shows the kana for a usually-kana word, even though it has kanji", () => {
    expect(displayForm({ kanjiText: "有る", kanaText: "ある", usuallyKana: true })).toBe("ある");
  });

  it("shows the kana when there is no kanji", () => {
    expect(displayForm({ kanjiText: null, kanaText: "ここ", usuallyKana: false })).toBe("ここ");
  });
});

describe("displayFurigana", () => {
  const furigana = [{ text: "有", reading: "あ" }, { text: "る" }];

  it("drops furigana for a kana headword", () => {
    const word = { kanjiText: "有る", kanaText: "ある", usuallyKana: true };
    expect(displayFurigana(word, furigana)).toEqual([{ text: "ある" }]);
  });

  it("keeps furigana for a kanji headword", () => {
    const word = { kanjiText: "有る", kanaText: "ある", usuallyKana: false };
    expect(displayFurigana(word, furigana)).toBe(furigana);
  });
});
