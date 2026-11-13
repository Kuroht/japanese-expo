// Public API of the kanji feature (logic and data, no UI yet).
export type {
  ComponentDetails,
  ComponentKanjiInfo,
  KanjiComponentInfo,
  KanjiDetails,
  KanjiExampleWord,
  KanjiStrokeData,
  PrerequisiteItem,
  PrerequisiteLookup,
} from "./types";

export { expandWithPrerequisites } from "./lib/expandWithPrerequisites";
export { resolveMnemonic } from "./lib/mnemonicText";
export { kanjiLookup } from "./api/kanjiLookup";
export { getKanjiDetails } from "./api/getKanjiDetails";
export { getComponentDetails } from "./api/getComponentDetails";
export { saveMnemonic } from "./api/saveMnemonic";
