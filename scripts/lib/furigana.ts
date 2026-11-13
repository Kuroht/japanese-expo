import { containsKanji, isKanjiCharacter, katakanaToHiragana } from "./kana";

// One piece of a word. "reading" is only set for pieces that contain kanji.
export type FuriganaSegment = { text: string; reading?: string };

// A run of the written word: either all kanji or all non-kanji (kana etc.).
type Run = { text: string; isKanji: boolean };

// Splits "食べ物" into [食][べ][物] so each run can be matched against the reading.
function splitIntoRuns(text: string): Run[] {
  const runs: Run[] = [];
  for (const character of text) {
    const isKanji = isKanjiCharacter(character);
    const lastRun = runs[runs.length - 1];
    if (lastRun && lastRun.isKanji === isKanji) {
      lastRun.text += character;
    } else {
      runs.push({ text: character, isKanji });
    }
  }
  return runs;
}

// Finds every way to split the reading over the runs (stops counting at 2).
// Kana runs must match exactly; each kanji run takes at least one character.
function collect(
  runs: Run[],
  reading: string,
  runIndex: number,
  chosen: string[],
  found: string[][],
): string[][] {
  if (found.length >= 2) return found;
  if (runIndex === runs.length) {
    if (reading === "") found.push(chosen);
    return found;
  }

  const run = runs[runIndex];
  if (!run.isKanji) {
    const kana = katakanaToHiragana(run.text);
    if (reading.startsWith(kana)) {
      collect(runs, reading.slice(kana.length), runIndex + 1, [...chosen, kana], found);
    }
    return found;
  }

  // Kanji run: try every possible length of reading for it.
  for (let length = 1; length <= reading.length; length++) {
    collect(
      runs,
      reading.slice(length),
      runIndex + 1,
      [...chosen, reading.slice(0, length)],
      found,
    );
  }
  return found;
}

// Turns a written word and its reading into pieces, so only kanji get readings.
// 食べ物 + たべもの -> [{食,た}, {べ}, {物,もの}]
// If the split is missing or ambiguous, we fall back to one piece with the full reading.
export function alignFurigana(writtenText: string, reading: string): FuriganaSegment[] {
  const hiraganaReading = katakanaToHiragana(reading);
  if (!containsKanji(writtenText) || hiraganaReading === "") {
    return [{ text: writtenText }];
  }

  const fallback: FuriganaSegment[] = [{ text: writtenText, reading: hiraganaReading }];
  const runs = splitIntoRuns(writtenText);
  const splits = collect(runs, hiraganaReading, 0, [], []);
  if (splits.length !== 1) return fallback;

  return runs.map((run, index) => {
    if (!run.isKanji) return { text: run.text };
    return { text: run.text, reading: splits[0][index] };
  });
}
