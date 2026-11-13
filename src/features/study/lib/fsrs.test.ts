import { Rating, State } from "ts-fsrs";

import { effectiveRating } from "./effectiveRating";
import { gradeCard, newCardRow, retrievability } from "./fsrs";

const NOW = new Date("2026-01-01T10:00:00Z").getTime();
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

describe("scheduling", () => {
  it("creates a new card that is due now", () => {
    const card = newCardRow("kana", "シ", "recognition", NOW);
    expect(card.due).toBe(NOW);
    expect(card.state).toBe(State.New);
    expect(card.last_review).toBeNull();
  });

  it("keeps a new card short after Again", () => {
    const card = newCardRow("kana", "シ", "recognition", NOW);
    const { card: next, log } = gradeCard(card, Rating.Again, NOW, false);
    expect(next.due - NOW).toBeLessThan(DAY);
    expect(next.reps).toBe(1);
    expect(log.rating).toBe(Rating.Again);
    expect(log.reviewed_at).toBe(NOW);
  });

  it("grows the interval with Good, then Good", () => {
    const first = gradeCard(newCardRow("kana", "シ", "recognition", NOW), Rating.Good, NOW, false);
    const secondTime = first.card.due;
    const second = gradeCard(first.card, Rating.Good, secondTime, false);
    expect(second.card.state).toBe(State.Review);
    expect(second.card.scheduled_days).toBeGreaterThanOrEqual(1);

    const thirdTime = second.card.due;
    const third = gradeCard(second.card, Rating.Good, thirdTime, false);
    expect(third.card.scheduled_days).toBeGreaterThan(second.card.scheduled_days);
  });

  it("lowers retrievability as time passes", () => {
    const first = gradeCard(newCardRow("kana", "シ", "recognition", NOW), Rating.Good, NOW, false);
    const reviewed = gradeCard(first.card, Rating.Good, first.card.due, false).card;
    const soon = retrievability(reviewed, reviewed.due);
    const later = retrievability(reviewed, reviewed.due + 30 * DAY);
    expect(later).toBeLessThan(soon);
    expect(retrievability(newCardRow("kana", "シ", "recognition", NOW), NOW)).toBe(0);
  });
});

describe("effectiveRating", () => {
  const fresh = newCardRow("kana", "し", "recognition", NOW);

  it("turns the first Good on a hiragana card into Easy", () => {
    expect(effectiveRating("kana", "し", fresh, Rating.Good)).toBe(Rating.Easy);
  });

  it("keeps other ratings and later reviews unchanged", () => {
    expect(effectiveRating("kana", "し", fresh, Rating.Again)).toBe(Rating.Again);
    expect(effectiveRating("kana", "し", { ...fresh, reps: 1 }, Rating.Good)).toBe(Rating.Good);
  });

  it("does not change katakana or loanwords", () => {
    expect(effectiveRating("kana", "シ", fresh, Rating.Good)).toBe(Rating.Good);
    expect(effectiveRating("loanword", "123", fresh, Rating.Good)).toBe(Rating.Good);
  });
});
