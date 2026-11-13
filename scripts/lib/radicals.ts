import { containsKanji } from "./kana";

// Reads UnicodeData.txt and returns Kangxi radical names keyed by the regular kanji.
// "2F54;KANGXI RADICAL WATER;..." -> { "水": "water" } (the radical char is NFKC-normalised).
export function parseKangxiNames(unicodeDataText: string): Map<string, string> {
  const names = new Map<string, string>();
  const prefix = "KANGXI RADICAL ";

  for (const line of unicodeDataText.split("\n")) {
    const fields = line.split(";");
    const codePoint = parseInt(fields[0], 16);
    const inKangxiBlock = codePoint >= 0x2f00 && codePoint <= 0x2fd5;
    if (!inKangxiBlock || !fields[1]?.startsWith(prefix)) continue;

    const kanji = String.fromCodePoint(codePoint).normalize("NFKC");
    if (!containsKanji(kanji)) continue;
    names.set(kanji, fields[1].slice(prefix.length).toLowerCase());
  }
  return names;
}
