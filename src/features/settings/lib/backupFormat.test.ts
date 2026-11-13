import { BACKUP_COLUMNS, buildInsertStatements, validateBackup } from "./backupFormat";

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
