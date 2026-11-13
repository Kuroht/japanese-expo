import { progressMigrations } from "@/shared/db/progressMigrations";

import {
  BACKUP_COLUMNS,
  BACKUP_SCHEMA,
  ITEM_STATUSES,
  NUMBER_RANGES,
  type BackupTableName,
  type ColumnKind,
} from "./backupSchema";

export { BACKUP_COLUMNS };
export type { BackupTableName };
export const BACKUP_TABLE_NAMES = Object.keys(BACKUP_SCHEMA) as BackupTableName[];

// A backup file larger than this is refused before it is read into memory.
export const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

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

// True when the value fits the column kind (see backupSchema.ts).
function fitsKind(value: unknown, kind: ColumnKind): boolean {
  if (value === null) return kind.endsWith("?");
  if (kind === "text") return typeof value === "string";
  if (kind === "real") return typeof value === "number" && Number.isFinite(value);
  return Number.isSafeInteger(value);
}

// Checks the allowed values of one column, such as items.status or review_log.rating.
// The kind was already checked, so a range column is known to be a number here.
function hasAllowedValue(table: BackupTableName, column: string, value: unknown): boolean {
  if (table === "items" && column === "status") return ITEM_STATUSES.includes(value as string);
  const range = NUMBER_RANGES.find((entry) => entry.table === table && entry.column === column);
  if (!range) return true;
  return (value as number) >= range.min && (value as number) <= range.max;
}

// Checks one table: every row is an object and every column has the right kind and value.
function validateRows(table: BackupTableName, rows: unknown[]): void {
  const kinds: Record<string, ColumnKind> = BACKUP_SCHEMA[table];
  rows.forEach((row, index) => {
    if (!isPlainObject(row)) {
      throw new Error(`Backup table "${table}": row ${index + 1} is not an object.`);
    }
    for (const column of BACKUP_COLUMNS[table]) {
      const value = row[column];
      if (!fitsKind(value, kinds[column]) || !hasAllowedValue(table, column, value)) {
        throw new Error(`Backup table "${table}": row ${index + 1} has a bad "${column}" value.`);
      }
    }
  });
}

// A learning item with no cards would never be shown or scheduled, so the file is broken.
function checkLearningItemsHaveCards(tables: Record<BackupTableName, BackupRow[]>): void {
  const keyOf = (row: BackupRow) => `${row.item_type}:${row.item_key}`;
  const itemsWithCards = new Set(tables.cards.map(keyOf));
  for (const item of tables.items) {
    if (item.status === "learning" && !itemsWithCards.has(keyOf(item))) {
      throw new Error(`Backup item "${item.item_key}" is being learned but has no cards.`);
    }
  }
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
  const backup = json as BackupFile;
  checkLearningItemsHaveCards(backup.tables);
  return backup;
}

// The summary shown before an import replaces everything: when it was made and how big it is.
export function describeBackup(backup: BackupFile): string {
  const { items, cards, review_log: reviews } = backup.tables;
  const madeAt = new Date(backup.exportedAt);
  const dateText = Number.isNaN(madeAt.getTime()) ? backup.exportedAt : madeAt.toLocaleString();
  return `Backup from ${dateText}: ${items.length} items, ${cards.length} cards, ${reviews.length} reviews.`;
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
