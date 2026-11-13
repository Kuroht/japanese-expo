import { assertJlptCsvFormat, assertJmdictFormat } from "./validators";

describe("validators", () => {
  it("throws with the file name and the first bad record", () => {
    const badData = { words: [{ id: 5, kanji: [], kana: [], sense: [] }] };
    expect(() => assertJmdictFormat("jmdict.json", badData)).toThrow(/jmdict\.json.*"id":5/);
  });

  it("accepts a valid JLPT CSV and rejects a wrong header", () => {
    const header = ["jmdict_seq", "kana", "kanji", "waller_definition"];
    expect(() => assertJlptCsvFormat("n5.csv", [header, ["1", "あ", "", "ah"]])).not.toThrow();
    expect(() => assertJlptCsvFormat("n5.csv", [["id", "kana"]])).toThrow(/n5\.csv/);
  });
});
