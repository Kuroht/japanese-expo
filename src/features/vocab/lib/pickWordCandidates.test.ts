import { pickWordCandidates, type WordCandidateRow } from "./pickWordCandidates";

const row = (
  id: number,
  jlpt: number | null,
  order: number,
  kana = "あ",
  kanji: string | null = "字",
): WordCandidateRow => ({ id, jlpt, study_order: order, kanji_text: kanji, kana_text: kana });
const none = () => false;
const ids = (items: { itemKey: string }[]) => items.map((item) => item.itemKey);

describe("pickWordCandidates", () => {
  it("teaches N5 before N4, each in study order", () => {
    const rows = [row(1, 4, 1), row(2, 5, 30), row(3, 5, 20), row(4, 3, 2)];
    expect(ids(pickWordCandidates(rows, none, 10))).toEqual(["3", "2", "1"]);
  });

  it("skips loanwords but keeps short katakana words and kanji words", () => {
    const rows = [
      row(1, 5, 1, "コーヒー", null),
      row(2, 5, 2, "ペン", null),
      row(3, 5, 3, "アイス", "氷"),
    ];
    expect(ids(pickWordCandidates(rows, none, 10))).toEqual(["2", "3"]);
  });

  it("skips introduced words and respects the limit", () => {
    const rows = [row(1, 5, 1), row(2, 5, 2), row(3, 5, 3)];
    const isIntroduced = (type: string, key: string) => type === "word" && key === "1";
    expect(ids(pickWordCandidates(rows, isIntroduced, 1))).toEqual(["2"]);
  });
});
