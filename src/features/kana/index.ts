// Public API of the kana feature (logic and data, no UI yet).
export type { KanaEntry, KanaGroup, KanaItemRef, KanaScript, LoanwordDetails } from "./types";

export {
  ALL_KANA_ENTRIES,
  HIRAGANA_ENTRIES,
  KATAKANA_ENTRIES,
  findKanaEntry,
} from "./data/kanaData";
export { CONFUSABLE_GROUPS, confusablePartners, reverseOptions } from "./lib/confusables";
export { checkRomaji } from "./lib/checkRomaji";
export { kanaItemProvider } from "./api/kanaItemProvider";
export { getLoanwordDetails } from "./api/loanwords";
