import type { SQLiteDatabase } from "expo-sqlite";

import { getContentDbPath, installContentDb } from "./installContentDb";
import { migrateProgress } from "./migrateProgress";

export const PROGRESS_DB_NAME = "progress.db";

// Runs once when the app starts (SQLiteProvider onInit):
// 1. copy the content DB out of the app bundle, 2. migrate progress.db,
// 3. attach the content DB as "content" so one query can join both.
export async function setupDatabases(db: SQLiteDatabase): Promise<void> {
  await installContentDb();
  await migrateProgress(db);
  // ATTACH only applies to this connection. withExclusiveTransactionAsync opens a separate
  // connection that can NOT see content.*, so use withTransactionAsync for any query
  // that joins progress with content.
  // ATTACH cannot take a bound parameter, so escape single quotes by hand.
  const safePath = getContentDbPath().replace(/'/g, "''");
  await db.execAsync(`ATTACH DATABASE '${safePath}' AS content`);
}
