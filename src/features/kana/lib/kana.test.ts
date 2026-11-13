import { ALL_KANA_ENTRIES, KATAKANA_ENTRIES } from "../data/kanaData";
import { checkRomaji } from "./checkRomaji";
import { CONFUSABLE_GROUPS, confusablePartners, reverseOptions } from "./confusables";
import { orderedKanaKeys, pickCandidates } from "./pickCandidates";

describe("kana data", () => {
  it("has no duplicate kana and every kana is in its own script", () => {
    const keys = ALL_KANA_ENTRIES.map((entry) => entry.kana);
    expect(new Set(keys).size).toBe(keys.length);
    expect(KATAKANA_ENTRIES.filter((entry) => entry.group === "basic")).toHaveLength(46);
  });

  it("has every confusable kana in the data", () => {
    const keys = new Set(ALL_KANA_ENTRIES.map((entry) => entry.kana));
    for (const kana of CONFUSABLE_GROUPS.flat()) expect(keys.has(kana)).toBe(true);
  });
});

describe("checkRomaji", () => {
  it.each([
    ["シ", "shi"],
    ["シ", "si"],
    ["ツ", "tsu"],
    ["ツ", "tu"],
    ["チ", "chi"],
    ["チ", "ti"],
    ["ジ", "zi"],
    ["フ", "hu"],
    ["フ", " FU "],
    ["ン", "n"],
    ["ン", "nn"],
    ["ヲ", "wo"],
    ["ヲ", "o"],
    ["ヂ", "ji"],
    ["ッカ", "kka"],
    ["カー", "kaa"],
    ["カー", "ka-"],
    ["キャ", "kya"],
    ["ティ", "ti"],
    ["ティ", "thi"],
    ["ファ", "fa"],
    ["ヴ", "vu"],
    ["し", "si"],
  ])("accepts %s typed as %s", (kana, typed) => {
    expect(checkRomaji(kana, typed)).toBe(true);
  });

  it.each([
    ["シ", "tsu"],
    ["ン", "so"],
    ["シ", ""],
    ["カー", "ka"],
  ])("rejects %s typed as '%s'", (kana, typed) => {
    expect(checkRomaji(kana, typed)).toBe(false);
  });

  it("checks whole loanwords and either long-vowel spelling", () => {
    expect(checkRomaji("コンピューター", "konpyuutaa")).toBe(true);
    expect(checkRomaji("コンピューター", "konpyu-ta-")).toBe(true);
    expect(checkRomaji("レストラン", "resutoran")).toBe(true);
    expect(checkRomaji("レストラン", "resutora")).toBe(false);
    expect(checkRomaji("パーティー", "paatii")).toBe(true);
    expect(checkRomaji("パーティー", "pa-ti-")).toBe(true);
  });
});

describe("reverseOptions", () => {
  it("returns 4 unique options with the answer and its partners", () => {
    const options = reverseOptions("ク", 1);
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options).toEqual(expect.arrayContaining(["ク", "ケ", "タ"]));
  });

  it("is repeatable for the same seed", () => {
    expect(reverseOptions("シ", 7)).toEqual(reverseOptions("シ", 7));
  });

  it("fills with the same script when there are no partners", () => {
    const options = reverseOptions("ア", 3);
    expect(options).toHaveLength(4);
    expect(options).toContain("ア");
    expect(confusablePartners("ア")).toEqual([]);
  });

  it("works for hiragana and keeps hiragana partners", () => {
    const options = reverseOptions("は", 2);
    expect(options).toContain("ほ");
    expect(options.every((kana) => /^[ぁ-ん]+$/.test(kana))).toBe(true);
  });
});

describe("provider ordering", () => {
  const none = () => false;
  const loanwords = ["900", "901", "902", "903"];

  it("interleaves 1 hiragana after every 2 katakana", () => {
    const keys = orderedKanaKeys();
    expect(keys.slice(0, 6)).toEqual(["ア", "イ", "あ", "ウ", "エ", "い"]);
    expect(new Set(keys).size).toBe(ALL_KANA_ENTRIES.length);
  });

  it("gives no loanwords before all basic katakana are introduced", () => {
    const result = pickCandidates({ isIntroduced: none, loanwordIds: loanwords, limit: 100 });
    const firstLoanword = result.findIndex((item) => item.itemType === "loanword");
    const lastBasic = result.findIndex((item) => item.itemKey === "ン");
    expect(firstLoanword).toBeGreaterThan(lastBasic);
  });

  it("adds 1 loanword per 2 kana after the basics", () => {
    const basics = new Set(KATAKANA_ENTRIES.slice(0, 46).map((entry) => entry.kana));
    const isIntroduced = (type: string, key: string) => type === "kana" && basics.has(key);
    const result = pickCandidates({ isIntroduced, loanwordIds: loanwords, limit: 6 });
    expect(result.map((item) => item.itemType)).toEqual([
      "kana", "kana", "loanword", "kana", "kana", "loanword",
    ]); // prettier-ignore
  });

  it("gives only loanwords when all kana are introduced, and skips introduced ones", () => {
    const isIntroduced = (type: string, key: string) => type === "kana" || key === "900";
    const result = pickCandidates({ isIntroduced, loanwordIds: loanwords, limit: 10 });
    expect(result.map((item) => item.itemKey)).toEqual(["901", "902", "903"]);
  });

  it("respects the limit", () => {
    expect(pickCandidates({ isIntroduced: none, loanwordIds: [], limit: 5 })).toHaveLength(5);
  });
});
