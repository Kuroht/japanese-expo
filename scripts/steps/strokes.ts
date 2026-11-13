import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { extractStrokePaths } from "../lib/kanjivg";
import type { KanjiRow, KanjiStrokesRow } from "../lib/types";
import { assertKanjivgFormat } from "../lib/validators";
import { CACHE_DIR } from "./download";

const KANJIVG_FOLDER = path.join(CACHE_DIR, "kanjivg", "kanji");

// KanjiVG names files by the 5-digit hex code point: 食 -> 098df.svg
function svgFileName(char: string): string {
  const hex = (char.codePointAt(0) ?? 0).toString(16).padStart(5, "0");
  return `${hex}.svg`;
}

// Reads the stroke paths of every kept kanji that KanjiVG has a file for.
export function loadStrokes(kanjiRows: KanjiRow[]): KanjiStrokesRow[] {
  const rows: KanjiStrokesRow[] = [];
  const missing: string[] = [];

  for (const kanji of kanjiRows) {
    const fileName = svgFileName(kanji.char);
    const filePath = path.join(KANJIVG_FOLDER, fileName);
    if (!existsSync(filePath)) {
      missing.push(kanji.char);
      continue;
    }

    const svgText = readFileSync(filePath, "utf8");
    assertKanjivgFormat(fileName, svgText);
    const strokes = extractStrokePaths(svgText);
    if (strokes) rows.push({ kanji: kanji.char, viewBox: strokes.viewBox, paths: strokes.paths });
  }

  if (missing.length > 0) {
    console.warn(
      `WARNING: ${missing.length} kanji have no KanjiVG file. First 20: ${missing.slice(0, 20).join(" ")}`,
    );
  }
  return rows;
}
