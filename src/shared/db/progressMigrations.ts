// Progress DB migrations, applied in order. The index + 1 is the PRAGMA user_version.
// Never edit an old migration after release: add a new one at the end instead.
const migration1 = `
CREATE TABLE items (
  item_type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('learning', 'known', 'suspended')),
  introduced_at INTEGER,
  PRIMARY KEY (item_type, item_key)
);
CREATE TABLE cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  card_type TEXT NOT NULL,
  due INTEGER NOT NULL,
  stability REAL NOT NULL DEFAULT 0,
  difficulty REAL NOT NULL DEFAULT 0,
  elapsed_days INTEGER NOT NULL DEFAULT 0,
  scheduled_days INTEGER NOT NULL DEFAULT 0,
  learning_steps INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  state INTEGER NOT NULL DEFAULT 0,
  last_review INTEGER,
  UNIQUE (item_type, item_key, card_type)
);
CREATE INDEX idx_cards_due ON cards (due);
CREATE TABLE review_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  state INTEGER NOT NULL,
  due INTEGER NOT NULL,
  stability REAL NOT NULL,
  difficulty REAL NOT NULL,
  elapsed_days INTEGER NOT NULL,
  last_elapsed_days INTEGER NOT NULL,
  scheduled_days INTEGER NOT NULL,
  reviewed_at INTEGER NOT NULL,
  duration_ms INTEGER
);
CREATE TABLE study_queue (
  item_type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  added_at INTEGER NOT NULL,
  PRIMARY KEY (item_type, item_key)
);
CREATE TABLE mnemonic_edits (
  kanji TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export const progressMigrations: string[] = [migration1];
