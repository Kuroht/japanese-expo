import { createReadStream } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { assertTatoebaLineFormat } from "../lib/validators";
import { CACHE_DIR } from "./download";

const SENTENCES_FILE = path.join(CACHE_DIR, "tatoeba-sentences", "sentences.csv");
const LINKS_FILE = path.join(CACHE_DIR, "tatoeba-links", "links.csv");

// Longest Japanese sentence (in characters) that we keep.
const MAX_JAPANESE_LENGTH = 25;

export type SentencePair = { id: number; japanese: string; english: string };

// Calls "handleLine" for every line of a big text file, without loading it all into memory.
async function forEachLine(filePath: string, handleLine: (line: string) => void): Promise<void> {
  const lines = createInterface({ input: createReadStream(filePath, "utf8"), crlfDelay: Infinity });
  for await (const line of lines) handleLine(line);
}

// Pass 1: short Japanese sentences, as id -> text.
async function readShortJapanese(): Promise<Map<number, string>> {
  const japanese = new Map<number, string>();
  let checkedFirstLine = false;
  await forEachLine(SENTENCES_FILE, (line) => {
    if (!checkedFirstLine) {
      assertTatoebaLineFormat("sentences.csv", line, 3);
      checkedFirstLine = true;
    }
    const [id, language, text] = line.split("\t");
    if (language !== "jpn" || text === undefined) return;
    if (Array.from(text).length <= MAX_JAPANESE_LENGTH) japanese.set(Number(id), text);
  });
  return japanese;
}

// Pass 2: for each Japanese id, the ids of its translations (links go both ways).
async function readTranslationIds(japanese: Map<number, string>): Promise<Map<number, number[]>> {
  const translationIds = new Map<number, number[]>();
  let checkedFirstLine = false;
  await forEachLine(LINKS_FILE, (line) => {
    if (!checkedFirstLine) {
      assertTatoebaLineFormat("links.csv", line, 2);
      checkedFirstLine = true;
    }
    const [sentenceId, translationId] = line.split("\t").map(Number);
    if (!japanese.has(sentenceId)) return;
    const existing = translationIds.get(sentenceId) ?? [];
    existing.push(translationId);
    translationIds.set(sentenceId, existing);
  });
  return translationIds;
}

// Pass 3: English text, only for the ids we need.
async function readEnglish(neededIds: Set<number>): Promise<Map<number, string>> {
  const english = new Map<number, string>();
  await forEachLine(SENTENCES_FILE, (line) => {
    const [id, language, text] = line.split("\t");
    if (language !== "eng" || text === undefined) return;
    if (neededIds.has(Number(id))) english.set(Number(id), text);
  });
  return english;
}

// Returns short Japanese sentences that have an English translation (the shortest one).
export async function loadSentencePairs(): Promise<SentencePair[]> {
  const japanese = await readShortJapanese();
  const translationIds = await readTranslationIds(japanese);
  const neededIds = new Set([...translationIds.values()].flat());
  const english = await readEnglish(neededIds);

  const pairs: SentencePair[] = [];
  for (const [id, ids] of translationIds) {
    const texts = ids
      .map((translationId) => english.get(translationId))
      .filter((text) => text !== undefined);
    if (texts.length === 0) continue;
    const shortest = texts.reduce((best, text) => (text.length < best.length ? text : best));
    pairs.push({ id, japanese: japanese.get(id) ?? "", english: shortest });
  }
  return pairs;
}
