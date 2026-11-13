import type { ComponentRow } from "./types";

// The shape of data/components.json: { "ノ": { "name": "slash" } }.
export type CustomNames = Record<string, { name: string }>;

// Picks a name for one component. data/components.json wins over the Unicode Kangxi name,
// so we can replace Kangxi names that are odd for learners. Returns null when neither has one.
export function pickComponentName(
  char: string,
  kangxiNames: Map<string, string>,
  customNames: CustomNames,
): Pick<ComponentRow, "name" | "source"> | null {
  const customName = customNames[char]?.name.trim();
  if (customName) return { name: customName, source: "custom" };
  const kangxiName = kangxiNames.get(char);
  if (kangxiName) return { name: kangxiName, source: "kangxi" };
  return null;
}

// Splits unnamed components into "must fix" (used by a taught N5/N4 kanji) and "just warn".
export function splitMissingNames(
  missingChars: string[],
  taughtComponentChars: Set<string>,
): { errors: string[]; warnings: string[] } {
  return {
    errors: missingChars.filter((char) => taughtComponentChars.has(char)),
    warnings: missingChars.filter((char) => !taughtComponentChars.has(char)),
  };
}
