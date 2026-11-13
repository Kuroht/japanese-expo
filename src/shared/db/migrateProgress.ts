import type { SQLiteDatabase } from "expo-sqlite";

import { progressMigrations } from "./progressMigrations";

// Brings progress.db up to the latest schema, using PRAGMA user_version to
// remember how many migrations have already run.
// Each migration and its version bump run in ONE transaction: if the app is killed
// halfway, both are rolled back and the migration simply runs again next launch.
export async function migrateProgress(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const currentVersion = row?.user_version ?? 0;

  for (let index = currentVersion; index < progressMigrations.length; index++) {
    await db.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.execAsync(progressMigrations[index]);
      // PRAGMA cannot take a bound parameter, and index is our own number.
      await transaction.execAsync(`PRAGMA user_version = ${index + 1}`);
    });
  }
}
