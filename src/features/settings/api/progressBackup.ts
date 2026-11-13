import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { SQLiteDatabase } from "expo-sqlite";

import {
  BACKUP_APP_NAME,
  BACKUP_COLUMNS,
  BACKUP_TABLE_NAMES,
  buildInsertStatements,
  validateBackup,
  type BackupFile,
  type BackupRow,
  type BackupTableName,
} from "../lib/backupFormat";

// Reads every progress table into a backup object.
async function buildBackup(db: SQLiteDatabase): Promise<BackupFile> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const tables = {} as Record<BackupTableName, BackupRow[]>;
  for (const table of BACKUP_TABLE_NAMES) {
    tables[table] = await db.getAllAsync<BackupRow>(
      `SELECT ${BACKUP_COLUMNS[table].join(", ")} FROM ${table}`,
    );
  }
  return {
    app: BACKUP_APP_NAME,
    schemaVersion: versionRow?.user_version ?? 0,
    exportedAt: new Date().toISOString(),
    tables,
  };
}

// Writes all progress to a JSON file in the cache folder and opens the share sheet.
// Returns the file uri. Throws if sharing is not available on this device.
export async function exportProgress(db: SQLiteDatabase): Promise<string> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }
  const backup = await buildBackup(db);
  const dateText = backup.exportedAt.slice(0, 10);
  const file = new File(Paths.cache, `japanese-progress-${dateText}.json`);
  // overwrite: exporting twice on the same day replaces the earlier file.
  file.create({ overwrite: true });
  await file.write(JSON.stringify(backup));
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Save your progress backup",
  });
  return file.uri;
}

// Lets the user pick a backup file and checks it. Returns null if they cancel.
// Throws an Error with a clear message when the file is not a usable backup.
export async function pickAndReadBackup(): Promise<BackupFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;

  const text = await new File(result.assets[0].uri).text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  return validateBackup(parsed);
}

// Replaces ALL progress with the backup, in one transaction: if anything fails, nothing changes.
// It replaces instead of merging because that is the simplest and most predictable result:
// afterwards the phone looks exactly like the phone that made the backup.
// (The main connection is fine here: these tables are all in progress.db, not in `content`.)
export async function importProgress(db: SQLiteDatabase, backup: BackupFile): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const table of BACKUP_TABLE_NAMES) {
      await db.runAsync(`DELETE FROM ${table}`);
    }
    for (const table of BACKUP_TABLE_NAMES) {
      const { sql, paramsList } = buildInsertStatements(table, backup.tables[table]);
      for (const params of paramsList) {
        await db.runAsync(sql, params);
      }
    }
  });
}
