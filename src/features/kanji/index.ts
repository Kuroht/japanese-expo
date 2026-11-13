// Public API of the kanji feature: logic, data and the reusable kanji UI.
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

export { useKanjiDetails } from "./hooks/useKanjiDetails";
export { useComponentDetails } from "./hooks/useComponentDetails";
export { ComponentInfo } from "./components/ComponentInfo";
export { KanjiDetailScreen } from "./components/KanjiDetailScreen";
export { KanjiInfo } from "./components/KanjiInfo";
export { KanjiStrokes } from "./components/KanjiStrokes";
export { StrokeOrderAnimation } from "./components/StrokeOrderAnimation";
