import { Rating } from "ts-fsrs";

import type { CardRow, ItemRef, StudySettings } from "../types";
import { buildSession, freshItemLimit, newItemLimit } from "./buildSession";
import { gradeCard, newCardRow } from "./fsrs";
import { DEFAULT_STUDY_SETTINGS, estimateMinutes } from "./studySettings";

const START = new Date("2026-01-01T10:00:00Z").getTime();
const DAY = 24 * 60 * 60 * 1000;
const NOW = START + 20 * DAY;

// Makes a reviewed card (two Goods) that is due long before NOW. Older = more forgotten.
let nextId = 1;
function makeDueCard(key: string, reviewedDaysBeforeNow: number): CardRow {
  const reviewTime = NOW - reviewedDaysBeforeNow * DAY;
  const first = gradeCard(
    newCardRow("kana", key, "recognition", reviewTime),
    Rating.Good,
    reviewTime,
    false,
  );
  const second = gradeCard(first.card, Rating.Good, first.card.due, false);
  return { ...second.card, id: nextId++, due: NOW - 1000 };
}

function makeDueCards(count: number): CardRow[] {
  return Array.from({ length: count }, (_, index) => makeDueCard(`k${index}`, 5));
}

const candidates: ItemRef[] = Array.from({ length: 20 }, (_, index) => ({
  itemType: "kana",
  itemKey: `c${index}`,
}));

function plan(
  dueCards: CardRow[],
  introducedToday = 0,
  settings: Partial<StudySettings> = {},
  unseenItems: ItemRef[] = [],
) {
  return buildSession({
    dueCards,
    unseenItems,
    newItemCandidates: candidates,
    introducedToday,
    settings: { ...DEFAULT_STUDY_SETTINGS, ...settings },
    now: NOW,
  });
}

describe("buildSession", () => {
  it("puts the most forgotten cards first", () => {
    const recent = makeDueCard("recent", 1);
    const old = makeDueCard("old", 15);
    const result = plan([recent, old]);
    expect(result.reviews.map((card) => card.item_key)).toEqual(["old", "recent"]);
  });

  it("ignores cards that are not due yet", () => {
    const future = { ...makeDueCard("future", 1), due: NOW + DAY };
    expect(plan([future]).reviews).toHaveLength(0);
  });

  it("caps the reviews and leaves the rest due", () => {
    const due = makeDueCards(70);
    const result = plan(due);
    expect(result.reviews).toHaveLength(60);
    expect(due.filter((card) => !result.reviews.includes(card))).toHaveLength(10);
  });

  it("keeps the whole first group even when it is bigger than the limit", () => {
    // The providers already trimmed to the limit; a word and its 2 kanji must stay together.
    const group = candidates.slice(0, 3);
    const result = buildSession({
      dueCards: [],
      unseenItems: [],
      newItemCandidates: group,
      introducedToday: 7, // limit is 1
      settings: DEFAULT_STUDY_SETTINGS,
      now: NOW,
    });
    expect(result.newItems).toEqual(group);
  });

  it("gives no fresh items when the limit is 0", () => {
    expect(plan([], 8).newItems).toHaveLength(0);
  });

  it("puts unseen items first and keeps them out of the reviews", () => {
    const unseen: ItemRef[] = [{ itemType: "kana", itemKey: "u0" }];
    const result = plan([], 0, {}, unseen);
    expect(result.newItems[0]).toEqual(unseen[0]);
    expect(result.reviews).toHaveLength(0);
  });
});

describe("newItemLimit", () => {
  it("is newItemsPerDay minus introducedToday", () => {
    expect(newItemLimit(0, 0, DEFAULT_STUDY_SETTINGS)).toBe(8);
    expect(newItemLimit(0, 5, DEFAULT_STUDY_SETTINGS)).toBe(3);
    expect(newItemLimit(0, 8, DEFAULT_STUDY_SETTINGS)).toBe(0);
    expect(newItemLimit(0, 20, DEFAULT_STUDY_SETTINGS)).toBe(0);
  });

  it("halves when the backlog is above the cap", () => {
    expect(newItemLimit(61, 0, DEFAULT_STUDY_SETTINGS)).toBe(4);
  });

  it("is 0 when the backlog is above 3x the cap", () => {
    expect(newItemLimit(181, 0, DEFAULT_STUDY_SETTINGS)).toBe(0);
    expect(newItemLimit(180, 0, DEFAULT_STUDY_SETTINGS)).toBe(4);
  });
});

describe("freshItemLimit", () => {
  it("takes the unseen items off the limit, never below 0", () => {
    expect(freshItemLimit(8, 3)).toBe(5);
    expect(freshItemLimit(2, 5)).toBe(0);
  });
});

describe("buildSession backlog", () => {
  it("spreads a backlog over several sessions", () => {
    const due = makeDueCards(130);
    const first = plan(due);
    const left = due.filter((card) => !first.reviews.includes(card));
    expect(left).toHaveLength(70);
    expect(plan(left).reviews).toHaveLength(60);
  });
});

describe("estimateMinutes", () => {
  it("adds 8 seconds per review and 40 per new item, rounded up", () => {
    expect(estimateMinutes({ reviews: new Array(60), newItems: new Array(8) })).toBe(14);
    expect(estimateMinutes({ reviews: [], newItems: [] })).toBe(0);
  });
});
