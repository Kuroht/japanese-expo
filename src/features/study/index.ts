// Public API of the study engine (logic and database access, no UI).
export { Rating } from "ts-fsrs";
export type {
  CardFields,
  CardRow,
  CardType,
  ItemRef,
  ItemType,
  NewCardRow,
  ReviewLogValues,
  SessionPlan,
  SessionStep,
  StudyRating,
  StudySettings,
} from "./types";

export { cardTypesFor } from "./lib/cardTypesFor";
export { effectiveRating } from "./lib/effectiveRating";
export { gradeCard, newCardRow, retrievability } from "./lib/fsrs";
export { buildSession } from "./lib/buildSession";
export { mixCandidates } from "./lib/mixCandidates";
export { answerStep, buildQueue, finishIntro } from "./lib/sessionQueue";
export type { NewItemWithCards } from "./lib/sessionQueue";
export { DEFAULT_STUDY_SETTINGS, estimateMinutes } from "./lib/studySettings";

export { countIntroducedToday, loadDueCards } from "./api/cardQueries";
export { introduceItem } from "./api/introduceItem";
export { markItemsKnown } from "./api/markItemsKnown";
export { unmarkItemsKnown } from "./api/unmarkItemsKnown";
export { markWordsKnown, unmarkWordsKnown } from "./api/knownWords";
export { getNewItemCandidates } from "./api/newItemCandidates";
export { prepareSession } from "./api/prepareSession";
export type { PreparedSession } from "./api/prepareSession";
export { saveReview } from "./api/saveReview";
export { loadSettings, saveSettings } from "./api/studySettingsStore";

// Screens and the preview for the study UI.
export { StudyHomeScreen } from "./components/StudyHomeScreen";
export { SessionScreen } from "./components/SessionScreen";
