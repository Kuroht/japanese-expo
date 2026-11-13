import { readFileSync } from "node:fs";
import path from "node:path";
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

// Picks a name for one component: Unicode Kangxi first, then data/components.json.
function findName(
  char: string,
  kangxiNames: Map<string, string>,
  customNames: Record<string, string>,
): Pick<ComponentRow, "name" | "source"> | null {
  const kangxiName = kangxiNames.get(char);
  if (kangxiName) return { name: kangxiName, source: "kangxi" };
  const customName = customNames[char];
  if (customName) return { name: customName, source: "custom" };
  return null;
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
  const customNames: Record<string, string> = JSON.parse(readFileSync(CUSTOM_NAMES_FILE, "utf8"));

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
    const found = findName(char, kangxiNames, customNames);
    if (!found) missingNames.push(char);
    return {
      char,
      name: found?.name ?? "",
      source: found?.source ?? "custom",
      strokes: strokesByChar.get(char) ?? null,
    };
  });

  if (missingNames.length > 0) {
    console.warn(
      `WARNING: ${missingNames.length} components have no name. First 20: ${missingNames.slice(0, 20).join(" ")}`,
    );
  }
  return { components, kanjiComponents };
}
