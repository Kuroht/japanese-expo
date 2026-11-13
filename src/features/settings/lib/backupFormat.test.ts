import {
  BACKUP_COLUMNS,
  buildInsertStatements,
  describeBackup,
  validateBackup,
} from "./backupFormat";

// A minimal valid backup with one settings row.
function makeBackup() {
  return {
    app: "japanese-expo",
    schemaVersion: 1,
    exportedAt: "2026-01-01T00:00:00.000Z",
    tables: {
      items: [],
      cards: [],
      review_log: [],
      study_queue: [],
      mnemonic_edits: [],
      settings: [{ key: "study", value: "{}" }],
    },
  };
}

describe("validateBackup", () => {
  it("accepts a valid backup", () => {
    expect(validateBackup(makeBackup()).tables.settings).toHaveLength(1);
  });

  it("rejects non-objects and other apps", () => {
    expect(() => validateBackup("hello")).toThrow("not a backup");
    expect(() => validateBackup({ ...makeBackup(), app: "other" })).toThrow("this app");
  });

  it("rejects a bad or newer schema version", () => {
    expect(() => validateBackup({ ...makeBackup(), schemaVersion: "1" })).toThrow("schema version");
    expect(() => validateBackup({ ...makeBackup(), schemaVersion: 999 })).toThrow("newer");
  });

  it("rejects a missing or non-array table", () => {
    const missing = makeBackup() as Record<string, unknown>;
    missing.tables = { ...makeBackup().tables, cards: undefined };
    expect(() => validateBackup(missing)).toThrow('"cards" is missing');
    missing.tables = { ...makeBackup().tables, items: {} };
    expect(() => validateBackup(missing)).toThrow('"items" is missing');
  });

  it("rejects rows that are not objects or lack a column", () => {
    const notObject = makeBackup() as Record<string, unknown>;
    notObject.tables = { ...makeBackup().tables, study_queue: [5] };
    expect(() => validateBackup(notObject)).toThrow("not an object");

    const missingColumn = makeBackup() as Record<string, unknown>;
    missingColumn.tables = { ...makeBackup().tables, settings: [{ key: "a" }] };
    expect(() => validateBackup(missingColumn)).toThrow('"value"');
  });
});

// A full valid card row, to change one value per test.
const goodCard = {
  id: 1,
  item_type: "kana",
  item_key: "a",
  card_type: "recognition",
  due: 1000,
  stability: 1.5,
  difficulty: 5,
  elapsed_days: 0,
  scheduled_days: 1,
  learning_steps: 0,
  reps: 1,
  lapses: 0,
  state: 2,
  last_review: null,
};
const goodReview = {
  id: 1,
  card_id: 1,
  rating: 3,
  state: 2,
  due: 1000,
  stability: 1.5,
  difficulty: 5,
  elapsed_days: 0,
  last_elapsed_days: 0,
  scheduled_days: 1,
  reviewed_at: 900,
  duration_ms: null,
};
const goodItem = { item_type: "kana", item_key: "a", status: "learning", introduced_at: null };

// Backup with the given rows for one table (others as in makeBackup).
function withRows(table: string, rows: unknown[]) {
  const backup = makeBackup();
  return { ...backup, tables: { ...backup.tables, [table]: rows } };
}

describe("validateBackup column checks", () => {
  it("accepts full valid rows", () => {
    const backup = makeBackup();
    const tables = {
      ...backup.tables,
      items: [goodItem],
      cards: [goodCard],
      review_log: [goodReview],
    };
    expect(validateBackup({ ...backup, tables }).tables.cards).toHaveLength(1);
  });

  it.each([
    ["cards", { ...goodCard, reps: 1.5 }, "reps"],
    ["cards", { ...goodCard, due: "1000" }, "due"],
    ["cards", { ...goodCard, due: null }, "due"],
    ["cards", { ...goodCard, stability: Infinity }, "stability"],
    ["cards", { ...goodCard, id: 2 ** 60 }, "id"],
    ["cards", { ...goodCard, item_key: 5 }, "item_key"],
    ["cards", { ...goodCard, state: 4 }, "state"],
    ["cards", { ...goodCard, state: -1 }, "state"],
    ["review_log", { ...goodReview, state: 9 }, "state"],
    ["review_log", { ...goodReview, rating: 0 }, "rating"],
    ["review_log", { ...goodReview, rating: 5 }, "rating"],
    ["items", { ...goodItem, status: "deleted" }, "status"],
  ])("rejects a bad value in %s", (table, row, column) => {
    expect(() => validateBackup(withRows(table, [row]))).toThrow(`"${column}"`);
  });

  it("allows a real number in a real column and null in a nullable column", () => {
    const backup = makeBackup();
    const card = { ...goodCard, stability: 0.123, last_review: 5 };
    const tables = { ...backup.tables, items: [goodItem], cards: [card] };
    expect(() => validateBackup({ ...backup, tables })).not.toThrow();
  });

  it("rejects a learning item that has no cards", () => {
    expect(() => validateBackup(withRows("items", [goodItem]))).toThrow("no cards");
  });

  it("allows a known item without cards", () => {
    const known = { ...goodItem, status: "known" };
    expect(() => validateBackup(withRows("items", [known]))).not.toThrow();
  });
});

describe("describeBackup", () => {
  it("shows the counts of items, cards and reviews", () => {
    const backup = validateBackup(withRows("settings", []));
    expect(describeBackup(backup)).toContain("0 items, 0 cards, 0 reviews");
  });
});

describe("buildInsertStatements", () => {
  it("lists the columns by name with one placeholder each", () => {
    const { sql } = buildInsertStatements("settings", []);
    expect(sql).toBe("INSERT INTO settings (key, value) VALUES (?, ?)");
  });

  it("orders the values like the columns and ignores extra keys", () => {
    const rows = [{ value: "{}", key: "study", extra: 1 }];
    expect(buildInsertStatements("settings", rows).paramsList).toEqual([["study", "{}"]]);
  });

  it("keeps ids for cards", () => {
    const { sql, paramsList } = buildInsertStatements("cards", [
      Object.fromEntries(BACKUP_COLUMNS.cards.map((column, index) => [column, index])),
    ]);
    expect(sql).toContain("(id, item_type");
    expect(paramsList[0][0]).toBe(0);
  });
});
