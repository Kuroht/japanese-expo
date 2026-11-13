import { alignFurigana } from "./furigana";

describe("alignFurigana", () => {
  it("splits okurigana after a kanji (食べる)", () => {
    expect(alignFurigana("食べる", "たべる")).toEqual([
      { text: "食", reading: "た" },
      { text: "べる" },
    ]);
  });

  it("handles kana between two kanji (食べ物)", () => {
    expect(alignFurigana("食べ物", "たべもの")).toEqual([
      { text: "食", reading: "た" },
      { text: "べ" },
      { text: "物", reading: "もの" },
    ]);
  });

  it("strips a leading kana prefix (お茶)", () => {
    expect(alignFurigana("お茶", "おちゃ")).toEqual([
      { text: "お" },
      { text: "茶", reading: "ちゃ" },
    ]);
  });

  it("gives a whole kanji run one reading (学校)", () => {
    expect(alignFurigana("学校", "がっこう")).toEqual([{ text: "学校", reading: "がっこう" }]);
  });

  it("returns kana-only words without a reading", () => {
    expect(alignFurigana("コンピューター", "コンピューター")).toEqual([{ text: "コンピューター" }]);
  });

  it("accepts a katakana reading", () => {
    expect(alignFurigana("食べる", "タベル")).toEqual([
      { text: "食", reading: "た" },
      { text: "べる" },
    ]);
  });

  it("falls back to one segment when the kana does not match", () => {
    expect(alignFurigana("食べる", "のむ")).toEqual([{ text: "食べる", reading: "のむ" }]);
  });
});
