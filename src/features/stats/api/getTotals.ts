import type { SQLiteDatabase } from "expo-sqlite";

import { windowStart } from "../lib/localDays";
import type { AllTimeTotals, ReviewTotals } from "../types";

type TotalsRow = { reviews: number; study_ms: number | null };

// Review count and study time since a timestamp (0 = since the beginning).
async function totalsSince(db: SQLiteDatabase, since: number): Promise<ReviewTotals> {
  const row = await db.getFirstAsync<TotalsRow>(
    `SELECT COUNT(*) AS reviews, SUM(duration_ms) AS study_ms
     FROM review_log WHERE reviewed_at >= ?`,
    [since],
  );
  return { reviews: row?.reviews ?? 0, studyMs: row?.study_ms ?? 0 };
}

// Reviews and study time over the last `days` local days (today included).
export function getRecentTotals(db: SQLiteDatabase, days = 30): Promise<ReviewTotals> {
  return totalsSince(db, windowStart(days, new Date()).getTime());
}

// Everything ever: reviews, study time, and items being learned or already known.
export async function getTotals(db: SQLiteDatabase): Promise<AllTimeTotals> {
  const totals = await totalsSince(db, 0);
  const items = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM items WHERE status IN ('learning', 'known')",
  );
  return { ...totals, itemsStudied: items?.count ?? 0 };
}
