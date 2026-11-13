// Public API of the vocab feature (logic and data, no UI yet).
// Bulk mark/unmark known lives in the study feature (markWordsKnown / unmarkWordsKnown).
export type {
  VocabListOptions,
  VocabListRow,
  VocabStatus,
  WordExample,
  WordItemRef,
  WordStudyDetails,
} from "./types";

export { wordItemProvider } from "./api/wordItemProvider";
export { getWordStudyDetails } from "./api/getWordStudyDetails";
export { listVocabWords } from "./api/listVocabWords";
