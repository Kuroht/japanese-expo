// What every progress column holds, taken from src/shared/db/progressMigrations.ts.
// Keep this table in sync with the migrations: a new column there needs a new line here.
//   "int"   = whole number (Number.isSafeInteger)
//   "real"  = any finite number (Number.isFinite)
//   "text"  = string
//   a "?" at the end means the column may be NULL
export type ColumnKind = "int" | "int?" | "real" | "text";

export const BACKUP_SCHEMA = {
  items: {
    item_type: "text",
    item_key: "text",
    status: "text",
    introduced_at: "int?",
  },
  cards: {
    id: "int",
    item_type: "text",
    item_key: "text",
    card_type: "text",
    due: "int",
    stability: "real",
    difficulty: "real",
    elapsed_days: "int",
    scheduled_days: "int",
    learning_steps: "int",
    reps: "int",
    lapses: "int",
    state: "int",
    last_review: "int?",
  },
  review_log: {
    id: "int",
    card_id: "int",
    rating: "int",
    state: "int",
    due: "int",
    stability: "real",
    difficulty: "real",
    elapsed_days: "int",
    last_elapsed_days: "int",
    scheduled_days: "int",
    reviewed_at: "int",
    duration_ms: "int?",
  },
  study_queue: { item_type: "text", item_key: "text", added_at: "int" },
  mnemonic_edits: { kanji: "text", text: "text", updated_at: "int" },
  settings: { key: "text", value: "text" },
} as const satisfies Record<string, Record<string, ColumnKind>>;

export type BackupTableName = keyof typeof BACKUP_SCHEMA;

// The columns of each table, in the order they are exported.
export const BACKUP_COLUMNS = Object.fromEntries(
  Object.entries(BACKUP_SCHEMA).map(([table, columns]) => [table, Object.keys(columns)]),
) as Record<BackupTableName, string[]>;

// Allowed values (from the CHECK and from ts-fsrs), checked after the kind.
export const ITEM_STATUSES = ["learning", "known", "suspended"];
export const NUMBER_RANGES: { table: BackupTableName; column: string; min: number; max: number }[] =
  [
    { table: "cards", column: "state", min: 0, max: 3 },
    { table: "review_log", column: "state", min: 0, max: 3 },
    { table: "review_log", column: "rating", min: 1, max: 4 },
  ];
