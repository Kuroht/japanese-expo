import { readFileSync } from "node:fs";
import { SOURCES } from "../sources";
import { parseCsv } from "../lib/csv";
import { assertJlptCsvFormat, assertKanjiDataFormat } from "../lib/validators";
import { sourcePath } from "./download";

function findSource(name: string) {
  const source = SOURCES.find((candidate) => candidate.name === name);
  if (!source) throw new Error(`Unknown source: ${name}`);
  return source;
}

// Reads the five JLPT vocab CSVs. Returns JMdict id -> level (5 = N5 = easiest).
// A word listed in several levels keeps the easier one (the higher number).
export function loadJlptWordLevels(): Map<number, number> {
  const levels = new Map<number, number>();
  const skippedRows: string[] = [];

  for (let level = 1; level <= 5; level++) {
    const filePath = sourcePath(findSource(`jlpt-n${level}`));
    const rows = parseCsv(readFileSync(filePath, "utf8"));
    assertJlptCsvFormat(`jlpt-n${level}.csv`, rows);

    for (const row of rows.slice(1)) {
      if (row.length !== 4) continue; // blank line
      // A few N1 rows have no JMdict id. We cannot match them, so we skip them.
      if (row[0] === "") {
        skippedRows.push(`${row[1]}/${row[2]}`);
        continue;
      }
      const id = Number(row[0]);
      levels.set(id, Math.max(levels.get(id) ?? 0, level));
    }
  }
  if (skippedRows.length > 0) {
    console.warn(
      `WARNING: skipped ${skippedRows.length} JLPT rows without a JMdict id: ${skippedRows.join(" ")}`,
    );
  }
  return levels;
}

// Reads kanji-data and returns kanji -> JLPT level (1-5). Kanji without a level are left out.
export function loadJlptKanjiLevels(): Map<string, number> {
  const filePath = sourcePath(findSource("kanji-data"));
  const data: Record<string, { jlpt_new: number | null }> = JSON.parse(
    readFileSync(filePath, "utf8"),
  );
  assertKanjiDataFormat("kanji-data.json", data);

  const levels = new Map<string, number>();
  for (const [kanji, entry] of Object.entries(data)) {
    if (entry.jlpt_new !== null) levels.set(kanji, entry.jlpt_new);
  }
  return levels;
}
