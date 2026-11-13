import { progressMigrations } from "@/shared/db/progressMigrations";

// The progress tables and their columns, in the order they are exported.
// Keep this in sync with progressMigrations.ts: a new column there needs adding here too.
export const BACKUP_COLUMNS = {
  items: ["item_type", "item_key", "status", "introduced_at"],
  cards: [
    "id",
    "item_type",
    "item_key",
    "card_type",
    "due",
    "stability",
    "difficulty",
    "elapsed_days",
    "scheduled_days",
    "learning_steps",
    "reps",
    "lapses",
    "state",
    "last_review",
  ],
  review_log: [
    "id",
    "card_id",
    "rating",
    "state",
    "due",
    "stability",
    "difficulty",
    "elapsed_days",
    "last_elapsed_days",
    "scheduled_days",
    "reviewed_at",
    "duration_ms",
  ],
  study_queue: ["item_type", "item_key", "added_at"],
  mnemonic_edits: ["kanji", "text", "updated_at"],
  settings: ["key", "value"],
} as const;

export type BackupTableName = keyof typeof BACKUP_COLUMNS;
export const BACKUP_TABLE_NAMES = Object.keys(BACKUP_COLUMNS) as BackupTableName[];

export const BACKUP_APP_NAME = "japanese-expo";

export type BackupValue = string | number | null;
export type BackupRow = Record<string, BackupValue>;

export type BackupFile = {
  app: string;
  schemaVersion: number;
  exportedAt: string;
  tables: Record<BackupTableName, BackupRow[]>;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Checks one table's rows: every row is an object holding every expected column with a simple value.
function validateRows(table: BackupTableName, rows: unknown[]): void {
  rows.forEach((row, index) => {
    if (!isPlainObject(row)) {
      throw new Error(`Backup table "${table}": row ${index + 1} is not an object.`);
    }
    for (const column of BACKUP_COLUMNS[table]) {
      const value = row[column];
      const isSimple = value === null || typeof value === "string" || typeof value === "number";
      if (!isSimple) {
        throw new Error(`Backup table "${table}": row ${index + 1} has a bad "${column}" value.`);
      }
    }
  });
}

// Checks that parsed JSON really is a backup this app version can restore.
// Throws an Error with a plain message on the first problem found.
export function validateBackup(json: unknown): BackupFile {
  if (!isPlainObject(json)) throw new Error("This file is not a backup.");
  if (json.app !== BACKUP_APP_NAME) {
    throw new Error("This file is not a backup from this app.");
  }
  const currentVersion = progressMigrations.length;
  const version = json.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    throw new Error("The backup has no valid schema version.");
  }
  if (version > currentVersion) {
    throw new Error("This backup is from a newer version of the app. Update the app first.");
  }
  if (!isPlainObject(json.tables)) throw new Error("The backup has no tables.");

  for (const table of BACKUP_TABLE_NAMES) {
    const rows = json.tables[table];
    if (!Array.isArray(rows)) throw new Error(`Backup table "${table}" is missing.`);
    validateRows(table, rows);
  }
  return json as BackupFile;
}

export type InsertStatements = {
  sql: string;
  // One list of values per row, in the same order as the columns in `sql`.
  paramsList: BackupValue[][];
};

// Builds one INSERT with named columns and bound parameters, plus the values for every row.
export function buildInsertStatements(table: BackupTableName, rows: BackupRow[]): InsertStatements {
  const columns = BACKUP_COLUMNS[table];
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
  const paramsList = rows.map((row) => columns.map((column) => row[column] ?? null));
  return { sql, paramsList };
}
