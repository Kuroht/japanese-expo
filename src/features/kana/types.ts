// Types for the kana feature.
export type KanaScript = "katakana" | "hiragana";

export type KanaGroup = "basic" | "dakuten" | "combo" | "small-tsu" | "long-vowel" | "extended";

// One kana (or a short pattern such as "ッカ") with its standard romaji.
export type KanaEntry = {
  kana: string;
  romaji: string;
  script: KanaScript;
  group: KanaGroup;
};

// What a kana item provider hands to the study engine (matches study's ItemRef).
export type KanaItemRef = { itemType: "kana" | "loanword"; itemKey: string };

// What the intro screen shows for a loanword.
export type LoanwordDetails = {
  id: number;
  kanaText: string;
  romaji: string | null;
  glosses: string[];
};
