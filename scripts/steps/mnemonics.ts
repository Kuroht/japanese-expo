import { readFileSync } from "node:fs";
import path from "node:path";
import type { KanjiRow, MnemonicRow } from "../lib/types";

const MNEMONICS_FILE = path.join(__dirname, "..", "..", "data", "mnemonics.json");

// Reads data/mnemonics.json ({ "休": "..." }) into default_mnemonics rows.
// A mnemonic for a kanji that is not in the DB is an error (probably a typo).
// An N5/N4 kanji without a mnemonic is only a warning.
export function loadMnemonics(kanjiRows: KanjiRow[]): MnemonicRow[] {
  const mnemonics: Record<string, string> = JSON.parse(readFileSync(MNEMONICS_FILE, "utf8"));
  const knownKanji = new Set(kanjiRows.map((row) => row.char));
  const unknown = Object.keys(mnemonics).filter((char) => !knownKanji.has(char));
  if (unknown.length > 0) {
    throw new Error(`mnemonics.json has kanji that are not in the DB: ${unknown.join(" ")}`);
  }

  const missing = kanjiRows
    .filter((row) => row.jlpt === 5 || row.jlpt === 4)
    .filter((row) => !mnemonics[row.char]?.trim())
    .map((row) => row.char);
  if (missing.length > 0) {
    console.warn(`WARNING: ${missing.length} N5/N4 kanji have no mnemonic: ${missing.join(" ")}`);
  }

  return Object.entries(mnemonics)
    .filter(([, text]) => text.trim() !== "")
    .map(([kanji, text]) => ({ kanji, text: text.trim() }));
}
