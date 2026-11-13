import type { SQLiteDatabase } from "expo-sqlite";

import { countByLocalDay, windowStart } from "../lib/localDays";
import type { DayCount } from "../types";

// Reviews per local day for the last `days` days (today included), zero days too.
// SQLite only fetches the timestamps; the day bucketing happens in JS so it uses the
// phone's timezone.
export async function getReviewsPerDay(db: SQLiteDatabase, days = 30): Promise<DayCount[]> {
  const now = new Date();
  const rows = await db.getAllAsync<{ reviewed_at: number }>(
    "SELECT reviewed_at FROM review_log WHERE reviewed_at >= ?",
    [windowStart(days, now).getTime()],
  );
  const timestamps = rows.map((row) => row.reviewed_at);
  return countByLocalDay(timestamps, days, now);
}
