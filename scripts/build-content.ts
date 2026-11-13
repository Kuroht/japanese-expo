// Entry point for `npm run build:content`. Runs every pipeline step in order.
import { downloadAll } from "./steps/download";
import { loadJlptKanjiLevels, loadJlptWordLevels } from "./steps/jlpt";
import { loadWords } from "./steps/words";
import { loadKanji } from "./steps/kanji";
import { loadComponents } from "./steps/components";
import { loadStrokes } from "./steps/strokes";
import { loadSentences } from "./steps/sentences";
import { printSummary, writeDatabase } from "./steps/writeDb";

// Prints a step title so long builds show progress.
function logStep(title: string): void {
  console.log(`\n== ${title}`);
}

async function main(): Promise<void> {
  logStep("1. download");
  await downloadAll();

  logStep("2. jlpt");
  const jlptWordLevels = loadJlptWordLevels();
  const jlptKanjiLevels = loadJlptKanjiLevels();
  console.log(`  ${jlptWordLevels.size} JLPT words, ${jlptKanjiLevels.size} JLPT kanji`);

  logStep("3. words");
  const { words, missingJlptIds } = loadWords(jlptWordLevels);
  console.log(`  kept ${words.length} words`);
  if (missingJlptIds.length > 0) {
    console.warn(
      `WARNING: ${missingJlptIds.length} JLPT ids not in JMdict. First 20: ${missingJlptIds.slice(0, 20).join(" ")}`,
    );
  }

  logStep("4. kanji");
  const kanji = loadKanji(words, jlptKanjiLevels);
  console.log(`  kept ${kanji.rows.length} kanji`);

  logStep("5. components");
  const { components, kanjiComponents } = loadComponents(kanji.rows, kanji.strokesByChar);

  logStep("6. strokes");
  const strokes = loadStrokes(kanji.rows);

  logStep("7. sentences");
  const { sentences, candidateCount } = await loadSentences(words);
  console.log(`  kept ${sentences.length} of ${candidateCount} candidate sentences`);

  logStep("8. write database");
  const databasePath = writeDatabase({
    words,
    kanji: kanji.rows,
    components,
    kanjiComponents,
    strokes,
    sentences,
  });
  printSummary(databasePath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
