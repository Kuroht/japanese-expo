import path from "node:path";
import kuromoji from "kuromoji";
import { alignFurigana, type FuriganaSegment } from "../lib/furigana";
import { katakanaToHiragana } from "../lib/kana";
import { selectSentences } from "../lib/sentenceSelection";
import { buildWordIndex, findWordId, type WordIndex } from "../lib/tokenMatch";
import type { BuiltWord, SentenceRow, WordForm } from "../lib/types";
import { applyRanking } from "./words";
import { loadSentencePairs, type SentencePair } from "./tatoebaSource";

// Examples kept per word. A sentence is kept while any of its words is below this.
const MAX_SENTENCES_PER_WORD = 5;

// A token as kuromoji gives it, before we know which word it is.
type RawToken = {
  surface: string;
  reading: string;
  baseForm: string;
  partOfSpeech: string;
};

type TokenizedSentence = { pair: SentencePair; tokens: RawToken[] };

// Builds the kuromoji tokenizer (loads its dictionary from node_modules).
function createTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  const dictionaryPath = path.join(__dirname, "..", "..", "node_modules", "kuromoji", "dict");
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: dictionaryPath }).build((error, tokenizer) => {
      if (error) reject(error);
      else resolve(tokenizer);
    });
  });
}

// Splits every sentence into tokens with hiragana readings.
function tokenizeAll(
  pairs: SentencePair[],
  tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>,
) {
  return pairs.map((pair): TokenizedSentence => {
    const tokens = tokenizer.tokenize(pair.japanese).map((token) => ({
      surface: token.surface_form,
      // Unknown words have no reading, so we fall back to the surface text.
      reading: token.reading ? katakanaToHiragana(token.reading) : token.surface_form,
      // kuromoji uses "*" when a token has no dictionary form.
      baseForm: token.basic_form === "*" ? token.surface_form : token.basic_form,
      partOfSpeech: token.pos,
    }));
    return { pair, tokens };
  });
}

// The form a learner sees as the word: its kanji, or its kana when it has no kanji or is
// usually written in kana. Other kana readings of a kanji word are only secondary.
function isPrimaryForm(word: BuiltWord, form: WordForm): boolean {
  if (form.kind === "kanji") return form.text === word.kanjiText;
  const kanaIsHeadword = word.kanjiText === null || word.usuallyKana;
  return kanaIsHeadword && form.text === word.kanaText;
}

// Makes the lookup from base form to the best kept word.
// "orderOf" decides the last tie-breaker (preliminary: id, final: study order).
function makeIndex(words: BuiltWord[], orderOf: (word: BuiltWord) => number): WordIndex {
  return buildWordIndex(
    words.map((word) => ({
      candidate: {
        id: word.id,
        hasJlpt: word.jlpt !== null,
        isCommon: word.isCommon,
        order: orderOf(word),
      },
      // Only usual spellings, so a rare irregular form can't steal a common word's text.
      forms: word.forms
        .filter((form) => form.isUsual)
        .map((form) => ({ text: form.text, isPrimaryForm: isPrimaryForm(word, form) })),
    })),
  );
}

// Finds the matched word id of every token in one sentence.
function matchTokens(sentence: TokenizedSentence, index: WordIndex): (number | null)[] {
  return sentence.tokens.map((token) =>
    findWordId(index, token.baseForm, token.surface, token.partOfSpeech),
  );
}

// Counts in how many sentences each word appears. This is our frequency measure.
function countWordUse(sentences: TokenizedSentence[], index: WordIndex): Map<number, number> {
  const counts = new Map<number, number>();
  for (const sentence of sentences) {
    const distinctIds = new Set(matchTokens(sentence, index));
    for (const wordId of distinctIds) {
      if (wordId !== null) counts.set(wordId, (counts.get(wordId) ?? 0) + 1);
    }
  }
  return counts;
}

// Builds the final row (tokens, furigana, word ids) for one sentence.
function buildSentenceRow(sentence: TokenizedSentence, index: WordIndex): SentenceRow {
  const wordIds = matchTokens(sentence, index);
  const furigana: FuriganaSegment[] = sentence.tokens.flatMap((token) =>
    alignFurigana(token.surface, token.reading),
  );

  return {
    id: sentence.pair.id,
    japanese: sentence.pair.japanese,
    english: sentence.pair.english,
    length: Array.from(sentence.pair.japanese).length,
    furigana: JSON.stringify(furigana),
    tokens: sentence.tokens.map((token, position) => ({
      surface: token.surface,
      reading: token.reading,
      baseForm: token.baseForm,
      wordId: wordIds[position],
    })),
    wordIds: [...new Set(wordIds.filter((wordId): wordId is number => wordId !== null))],
  };
}

export type SentencesResult = {
  sentences: SentenceRow[];
  candidateCount: number;
};

// Loads sentences, tokenizes them, ranks the words by corpus use (updating "words"),
// matches tokens to words and keeps a size-limited set of examples.
export async function loadSentences(words: BuiltWord[]): Promise<SentencesResult> {
  console.log("  reading Tatoeba files ...");
  const pairs = await loadSentencePairs();
  console.log(`  ${pairs.length} short sentences with a translation, tokenizing ...`);
  const tokenizer = await createTokenizer();
  const tokenized = tokenizeAll(pairs, tokenizer);

  // Pass 1: rough matching just to count word use, then rank the words.
  const roughIndex = makeIndex(words, (word) => word.id);
  applyRanking(words, countWordUse(tokenized, roughIndex));

  // Pass 2: final matching, now that study order is known.
  const finalIndex = makeIndex(words, (word) => word.studyOrder);
  const rows = tokenized.map((sentence) => buildSentenceRow(sentence, finalIndex));
  const kept = selectSentences(rows, MAX_SENTENCES_PER_WORD);
  return { sentences: kept, candidateCount: rows.length };
}
