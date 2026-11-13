import { fsrs, generatorParameters, State, type Card, type Grade } from "ts-fsrs";

import type { CardFields, NewCardRow, ReviewLogValues } from "../types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REQUEST_RETENTION = 0.9;

// Schedulers are cheap but we only need two: with fuzz (the app) and without (tests).
const schedulers = new Map<boolean, ReturnType<typeof fsrs>>();

function getScheduler(enableFuzz: boolean) {
  const existing = schedulers.get(enableFuzz);
  if (existing) return existing;
  const created = fsrs(
    generatorParameters({ request_retention: REQUEST_RETENTION, enable_fuzz: enableFuzz }),
  );
  schedulers.set(enableFuzz, created);
  return created;
}

// Converts our database fields into the card shape ts-fsrs wants (Date objects).
function toFsrsCard(card: CardFields): Card {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as State,
    last_review: card.last_review === null ? undefined : new Date(card.last_review),
  };
}

// A brand new card: due right away, never reviewed.
export function newCardRow(
  itemType: NewCardRow["item_type"],
  itemKey: string,
  cardType: NewCardRow["card_type"],
  now: number,
): NewCardRow {
  return {
    item_type: itemType,
    item_key: itemKey,
    card_type: cardType,
    due: now,
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: 0,
    lapses: 0,
    state: State.New,
    last_review: null,
  };
}

// Whole days between the last review and now (0 for a new card).
function daysSinceLastReview(card: CardFields, now: number): number {
  if (card.last_review === null) return 0;
  return Math.max(0, Math.floor((now - card.last_review) / MS_PER_DAY));
}

// Applies a rating. Returns the updated card and the review log values, ready to save.
// enableFuzz adds a little randomness to long intervals; tests pass false to stay exact.
export function gradeCard<T extends NewCardRow>(
  card: T,
  rating: Grade,
  now: number,
  enableFuzz = true,
): { card: T; log: ReviewLogValues } {
  const result = getScheduler(enableFuzz).next(toFsrsCard(card), new Date(now), rating);
  const elapsedDays = daysSinceLastReview(card, now);
  const next = result.card;
  return {
    card: {
      ...card,
      due: next.due.getTime(),
      stability: next.stability,
      difficulty: next.difficulty,
      elapsed_days: elapsedDays,
      scheduled_days: next.scheduled_days,
      learning_steps: next.learning_steps,
      reps: next.reps,
      lapses: next.lapses,
      state: next.state,
      last_review: now,
    },
    log: {
      rating,
      state: result.log.state,
      due: result.log.due.getTime(),
      stability: result.log.stability,
      difficulty: result.log.difficulty,
      elapsed_days: elapsedDays,
      last_elapsed_days: card.elapsed_days,
      scheduled_days: result.log.scheduled_days,
      reviewed_at: now,
    },
  };
}

// Chance (0 to 1) that the card is still remembered right now. New cards give 0.
export function retrievability(card: CardFields, now: number): number {
  if (card.state === State.New) return 0;
  return getScheduler(false).retrievability(toFsrsCard(card), new Date(now));
}
