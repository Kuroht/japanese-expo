import type { SQLiteDatabase } from "expo-sqlite";

import { parseStringList } from "@/shared/lib/parseJson";

import { TEACHABLE_JLPT_LEVELS } from "../lib/teachableKanji";
import type { ComponentDetails } from "../types";

const KANJI_LIMIT = 6;

// What a component card needs. Returns null when the component does not exist.
export async function getComponentDetails(
  db: SQLiteDatabase,
  char: string,
): Promise<ComponentDetails | null> {
  const component = await db.getFirstAsync<{ name: string; strokes: number | null }>(
    "SELECT name, strokes FROM content.components WHERE char = ?",
    [char],
  );
  if (!component) return null;

  const levelMarks = TEACHABLE_JLPT_LEVELS.map(() => "?").join(", ");
  // N5 before N4, then the more common kanji first.
  const kanji = await db.getAllAsync<{ char: string; meanings: string }>(
    `SELECT k.char, k.meanings FROM content.kanji_components kc
     JOIN content.kanji k ON k.char = kc.kanji
     WHERE kc.component = ? AND k.char != ? AND k.jlpt IN (${levelMarks})
     ORDER BY k.jlpt DESC, (k.freq IS NULL), k.freq, k.char
     LIMIT ?`,
    [char, char, ...TEACHABLE_JLPT_LEVELS, KANJI_LIMIT],
  );
  return {
    char,
    name: component.name,
    strokes: component.strokes,
    kanjiUsingIt: kanji.map((row) => ({
      char: row.char,
      meaning: parseStringList(row.meanings)[0] ?? "",
    })),
  };
}
