import { readFileSync } from "node:fs";
import path from "node:path";
import { pickComponentName, splitMissingNames, type CustomNames } from "../lib/componentNames";
import { parseKangxiNames } from "../lib/radicals";
import type { ComponentRow, KanjiComponentRow, KanjiRow } from "../lib/types";
import { assertKradfileFormat, assertUnicodeDataFormat } from "../lib/validators";
import { CACHE_DIR, findJsonFile } from "./download";

const UNICODE_DATA_FILE = path.join(CACHE_DIR, "unicode-data.txt");
const CUSTOM_NAMES_FILE = path.join(__dirname, "..", "..", "data", "components.json");

export type ComponentsResult = {
  components: ComponentRow[];
  kanjiComponents: KanjiComponentRow[];
};

// A component with no name is an ERROR when a taught kanji (N5/N4) uses it, else a warning.
function reportMissingNames(
  missingNames: string[],
  kanjiRows: KanjiRow[],
  kanjiComponents: KanjiComponentRow[],
): void {
  const taughtKanji = new Set(
    kanjiRows.filter((row) => row.jlpt === 5 || row.jlpt === 4).map((row) => row.char),
  );
  const taughtComponents = new Set(
    kanjiComponents.filter((row) => taughtKanji.has(row.kanji)).map((row) => row.component),
  );
  const { errors, warnings } = splitMissingNames(missingNames, taughtComponents);
  if (warnings.length > 0) {
    console.warn(
      `WARNING: ${warnings.length} components have no name (not used by N5/N4 kanji): ${warnings.join(" ")}`,
    );
  }
  if (errors.length > 0) {
    throw new Error(
      `${errors.length} components used by N5/N4 kanji have no name. Add them to data/components.json: ${errors.join(" ")}`,
    );
  }
}

// Builds kanji_components and components from KRADFILE for the kept kanji.
export function loadComponents(
  kanjiRows: KanjiRow[],
  strokesByChar: Map<string, number>,
): ComponentsResult {
  const kradfile: { kanji: Record<string, string[]> } = JSON.parse(
    readFileSync(findJsonFile("kradfile"), "utf8"),
  );
  assertKradfileFormat("kradfile json", kradfile);
  const unicodeText = readFileSync(UNICODE_DATA_FILE, "utf8");
  assertUnicodeDataFormat("UnicodeData.txt", unicodeText);
  const kangxiNames = parseKangxiNames(unicodeText);
  const customNames: CustomNames = JSON.parse(readFileSync(CUSTOM_NAMES_FILE, "utf8"));

  const kanjiComponents: KanjiComponentRow[] = [];
  const distinctComponents = new Set<string>();
  for (const kanjiRow of kanjiRows) {
    const componentChars = kradfile.kanji[kanjiRow.char] ?? [];
    componentChars.forEach((component, position) => {
      kanjiComponents.push({ kanji: kanjiRow.char, component, position });
      distinctComponents.add(component);
    });
  }

  const missingNames: string[] = [];
  const components: ComponentRow[] = [...distinctComponents].map((char) => {
    const found = pickComponentName(char, kangxiNames, customNames);
    if (!found) missingNames.push(char);
    return {
      char,
      name: found?.name ?? "",
      source: found?.source ?? "custom",
      strokes: strokesByChar.get(char) ?? null,
    };
  });

  reportMissingNames(missingNames, kanjiRows, kanjiComponents);
  return { components, kanjiComponents };
}
