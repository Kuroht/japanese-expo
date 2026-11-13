// Types shared by the study engine. The frontend imports them from "@/features/study".
import type { Grade } from "ts-fsrs";

// What kind of thing is studied. Later phases add word, kanji and component content.
export type ItemType = "kana" | "loanword" | "word" | "kanji" | "component";

// One studyable thing, e.g. { itemType: "kana", itemKey: "シ" }.
export type ItemRef = { itemType: ItemType; itemKey: string };

// How a card quizzes its item (each item type has its own card types).
export type CardType = "recognition" | "reverse" | "reading" | "listening" | "speaking";

// The FSRS scheduling state of one card. Dates are epoch milliseconds.
export type CardFields = {
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number; // ts-fsrs State: 0 New, 1 Learning, 2 Review, 3 Relearning
  last_review: number | null;
};

// A card that is not saved yet (no id).
export type NewCardRow = {
  item_type: ItemType;
  item_key: string;
  card_type: CardType;
} & CardFields;

// A row of the `cards` table.
export type CardRow = NewCardRow & { id: number };

// The values of one `review_log` row, except card_id.
export type ReviewLogValues = {
  rating: number;
  state: number;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  last_elapsed_days: number;
  scheduled_days: number;
  reviewed_at: number;
};

// 1 = Again, 2 = Hard, 3 = Good, 4 = Easy (use `Rating` from the study index).
export type StudyRating = Grade;

// User settings, saved in the `settings` table under the key "study".
export type StudySettings = {
  newItemsPerDay: number;
  maxReviewsPerSession: number;
  showHardEasy: boolean;
};

// What buildSession picked for today.
export type SessionPlan = { reviews: CardRow[]; newItems: ItemRef[] };

// One step of a running session. `againCount` = how often the card was re-queued.
export type SessionStep =
  { kind: "intro"; item: ItemRef } | { kind: "card"; card: CardRow; againCount: number };
