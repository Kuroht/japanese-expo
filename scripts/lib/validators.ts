// Hand-written format checks. Each one throws an Error that names the file
// and shows the first bad record, so a changed source format fails loudly.

type UnknownRecord = Record<string, unknown>;

// Throws the standard "unexpected format" error.
function fail(fileName: string, problem: string, record: unknown): never {
  const shown = JSON.stringify(record)?.slice(0, 300);
  throw new Error(`Unexpected format in ${fileName}: ${problem}. First bad record: ${shown}`);
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Checks the top-level shape and the first entry of the JMdict JSON.
export function assertJmdictFormat(fileName: string, data: unknown): void {
  if (!isRecord(data) || !Array.isArray(data.words))
    fail(fileName, "expected an object with a words array", data);
  const first: unknown = data.words[0];
  const isValid =
    isRecord(first) &&
    typeof first.id === "string" &&
    Array.isArray(first.kanji) &&
    Array.isArray(first.kana) &&
    Array.isArray(first.sense);
  if (!isValid) fail(fileName, "word needs id (string), kanji, kana and sense arrays", first);
}

// Checks the top-level shape and the first entry of the KANJIDIC2 JSON.
export function assertKanjidicFormat(fileName: string, data: unknown): void {
  if (!isRecord(data) || !Array.isArray(data.characters)) {
    fail(fileName, "expected an object with a characters array", data);
  }
  const first: unknown = data.characters[0];
  const isValid = isRecord(first) && typeof first.literal === "string" && isRecord(first.misc);
  if (!isValid) fail(fileName, "character needs literal (string) and misc (object)", first);
}

// Checks that KRADFILE maps each kanji to an array of component characters.
export function assertKradfileFormat(fileName: string, data: unknown): void {
  if (!isRecord(data) || !isRecord(data.kanji))
    fail(fileName, "expected an object with a kanji object", data);
  for (const [kanji, components] of Object.entries(data.kanji)) {
    if (!Array.isArray(components))
      fail(fileName, "components must be an array", { [kanji]: components });
  }
}

// Checks the header and every row of a JLPT vocab CSV (already parsed into rows).
export function assertJlptCsvFormat(fileName: string, rows: string[][]): void {
  const expectedHeader = ["jmdict_seq", "kana", "kanji", "waller_definition"];
  if (rows[0]?.join(",") !== expectedHeader.join(",")) {
    fail(fileName, `header must be ${expectedHeader.join(",")}`, rows[0]);
  }
  for (const row of rows.slice(1)) {
    if (row.length === 1 && row[0] === "") continue; // blank line
    if (row.length !== 4 || !/^\d*$/.test(row[0]))
      fail(fileName, "row needs 4 columns and a numeric (or blank) jmdict_seq", row);
  }
}

// Checks that kanji-data is an object keyed by kanji, with jlpt_new as 1-5 or null.
export function assertKanjiDataFormat(fileName: string, data: unknown): void {
  if (!isRecord(data)) fail(fileName, "expected an object keyed by kanji", data);
  for (const [kanji, entry] of Object.entries(data)) {
    const level = isRecord(entry) ? entry.jlpt_new : undefined;
    const isValidLevel = level === null || (typeof level === "number" && level >= 1 && level <= 5);
    if (!isValidLevel) fail(fileName, "jlpt_new must be 1-5 or null", { [kanji]: entry });
  }
}

// Checks that UnicodeData.txt still has the Kangxi radical lines we read.
export function assertUnicodeDataFormat(fileName: string, text: string): void {
  const hasWaterLine = text
    .split("\n")
    .some((line) => line.startsWith("2F54;KANGXI RADICAL WATER;"));
  if (!hasWaterLine)
    fail(fileName, "line for U+2F54 KANGXI RADICAL WATER not found", text.slice(0, 100));
}

// Checks one tab-separated Tatoeba line: sentences have 3 columns, links have 2.
export function assertTatoebaLineFormat(fileName: string, line: string, columnCount: number): void {
  const columns = line.split("\t");
  const idsAreNumbers = /^\d+$/.test(columns[0]);
  if (columns.length !== columnCount || !idsAreNumbers) {
    fail(
      fileName,
      `expected ${columnCount} tab-separated columns starting with a numeric id`,
      line,
    );
  }
}

// Checks that a KanjiVG SVG has a viewBox and at least one kvg stroke path.
export function assertKanjivgFormat(fileName: string, svgText: string): void {
  const hasViewBox = /<svg[^>]*\sviewBox="/.test(svgText);
  const hasStroke = /id="kvg:[0-9a-f]+-s1"/.test(svgText);
  if (!hasViewBox || !hasStroke)
    fail(fileName, "missing viewBox or kvg stroke path -s1", svgText.slice(0, 200));
}
