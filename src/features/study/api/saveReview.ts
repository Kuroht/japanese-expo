import type { SQLiteDatabase } from "expo-sqlite";

import { effectiveRating } from "../lib/effectiveRating";
import { gradeCard } from "../lib/fsrs";
import type { CardRow, StudyRating } from "../types";

// Grades a card, updates its `cards` row and adds a `review_log` row, in one transaction.
// The rating is first passed through effectiveRating (hiragana graduates fast); the log
// keeps the rating that was really applied. Returns the updated card.
export async function saveReview(
  db: SQLiteDatabase,
  cardBefore: CardRow,
  rating: StudyRating,
  now: number,
  durationMs: number,
): Promise<CardRow> {
  const { item_type, item_key } = cardBefore;
  const appliedRating = effectiveRating(item_type, item_key, cardBefore, rating);
  const { card, log } = gradeCard(cardBefore, appliedRating, now);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE cards SET due = ?, stability = ?, difficulty = ?, elapsed_days = ?,
         scheduled_days = ?, learning_steps = ?, reps = ?, lapses = ?, state = ?, last_review = ?
       WHERE id = ?`,
      [
        card.due,
        card.stability,
        card.difficulty,
        card.elapsed_days,
        card.scheduled_days,
        card.learning_steps,
        card.reps,
        card.lapses,
        card.state,
        card.last_review,
        card.id,
      ],
    );
    await db.runAsync(
      `INSERT INTO review_log (card_id, rating, state, due, stability, difficulty, elapsed_days,
         last_elapsed_days, scheduled_days, reviewed_at, duration_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        card.id,
        log.rating,
        log.state,
        log.due,
        log.stability,
        log.difficulty,
        log.elapsed_days,
        log.last_elapsed_days,
        log.scheduled_days,
        log.reviewed_at,
        durationMs,
      ],
    );
  });
  return card;
}
