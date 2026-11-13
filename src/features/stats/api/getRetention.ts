import type { SQLiteDatabase } from "expo-sqlite";

import { windowStart } from "../lib/localDays";
import type { Retention } from "../types";

// Below this many mature reviews the percentage would be noise, so we return null.
const MIN_REVIEWS = 10;

// Of the reviews made while a card was in Review state (state 2, a real recall rather than
// a learning step), how many were rated Hard, Good or Easy (rating >= 2).
export async function getRetention(db: SQLiteDatabase, days = 30): Promise<Retention> {
  const row = await db.getFirstAsync<{ total: number; correct: number | null }>(
    `SELECT COUNT(*) AS total, SUM(rating >= 2) AS correct
     FROM review_log WHERE state = 2 AND reviewed_at >= ?`,
    [windowStart(days, new Date()).getTime()],
  );
  const total = row?.total ?? 0;
  const correct = row?.correct ?? 0;
  if (total < MIN_REVIEWS) return { correct, total, percent: null };
  return { correct, total, percent: Math.round((correct / total) * 100) };
}
