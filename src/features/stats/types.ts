// One local calendar day and how many reviews happened on it. date is "YYYY-MM-DD".
export type DayCount = {
  date: string;
  count: number;
};

// Share of mature reviews that were remembered. percent is null when there is too little data.
export type Retention = {
  correct: number;
  total: number;
  percent: number | null;
};

// Review count and time spent over some period.
export type ReviewTotals = {
  reviews: number;
  studyMs: number;
};

export type AllTimeTotals = ReviewTotals & {
  itemsStudied: number;
};

// The item types we show, in display order.
export const STAT_ITEM_TYPES = ["kana", "loanword", "word", "kanji", "component"] as const;
export type StatItemType = (typeof STAT_ITEM_TYPES)[number];

export type Stage = "unseen" | "learning" | "young" | "mature" | "known";

// How many items of one type sit in each stage.
export type StageCounts = Record<Stage, number>;
export type ItemsByStage = Record<StatItemType, StageCounts>;

// What we know about one item's cards, as counted by the database.
export type ItemCardSummary = {
  itemType: string;
  status: string;
  cardCount: number;
  learningCards: number; // cards in state 1 (Learning) or 3 (Relearning)
  reviewCards: number; // cards in state 2 (Review)
  seenCards: number; // cards with reps > 0
  minScheduledDays: number;
};

export type Stats = {
  perDay: DayCount[];
  recentTotals: ReviewTotals;
  retention: Retention;
  itemsByStage: ItemsByStage;
  allTime: AllTimeTotals;
};
