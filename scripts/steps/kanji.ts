import { readFileSync } from "node:fs";
import { isKanjiCharacter } from "../lib/kana";
import type { BuiltWord, KanjiRow, RawKanjidicCharacter } from "../lib/types";
import { assertKanjidicFormat } from "../lib/validators";
import { findJsonFile } from "./download";

export type KanjiResult = {
  rows: KanjiRow[];
  // Stroke counts for every KANJIDIC2 character (used for component rows).
  strokesByChar: Map<string, number>;
};

// Grades 1-6 are the kyouiku kanji and 8 is the rest of the joyou kanji.
function isJoyou(grade: number | null): boolean {
  return grade !== null && (grade <= 6 || grade === 8);
}

// Collects every kanji character used in any form of the kept words.
function collectWordKanji(words: BuiltWord[]): Set<string> {
  const used = new Set<string>();
  for (const word of words) {
    for (const form of word.forms) {
      for (const character of form.text) {
        if (isKanjiCharacter(character)) used.add(character);
      }
    }
  }
  return used;
}

// Turns one KANJIDIC2 character into a DB row.
function buildKanjiRow(character: RawKanjidicCharacter, jlpt: number | null): KanjiRow {
  const groups = character.readingMeaning?.groups ?? [];
  const readings = groups.flatMap((group) => group.readings);
  const meanings = groups
    .flatMap((group) => group.meanings)
    .filter((meaning) => meaning.lang === "en");

  return {
    char: character.literal,
    meanings: meanings.map((meaning) => meaning.value),
    onyomi: readings.filter((reading) => reading.type === "ja_on").map((reading) => reading.value),
    kunyomi: readings
      .filter((reading) => reading.type === "ja_kun")
      .map((reading) => reading.value),
    strokes: character.misc.strokeCounts[0] ?? null,
    grade: character.misc.grade,
    freq: character.misc.frequency,
    jlpt,
  };
}

// Keeps joyou kanji plus every kanji used in a kept word.
export function loadKanji(words: BuiltWord[], jlptKanjiLevels: Map<string, number>): KanjiResult {
  const data: { characters: RawKanjidicCharacter[] } = JSON.parse(
    readFileSync(findJsonFile("kanjidic2"), "utf8"),
  );
  assertKanjidicFormat("kanjidic2-en json", data);

  const wordKanji = collectWordKanji(words);
  const rows: KanjiRow[] = [];
  const strokesByChar = new Map<string, number>();

  for (const character of data.characters) {
    const strokes = character.misc.strokeCounts[0];
    if (strokes !== undefined) strokesByChar.set(character.literal, strokes);

    const keep = isJoyou(character.misc.grade) || wordKanji.has(character.literal);
    if (!keep) continue;
    rows.push(buildKanjiRow(character, jlptKanjiLevels.get(character.literal) ?? null));
  }
  return { rows, strokesByChar };
}
