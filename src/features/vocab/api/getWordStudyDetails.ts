import type { SQLiteDatabase } from "expo-sqlite";

import type { SentenceRow, WordRow } from "@/shared/db/types";
import { displayForm, displayFurigana } from "@/shared/lib/displayForm";
import { parseFurigana, parseStringList } from "@/shared/lib/parseJson";

import type { WordStudyDetails } from "../types";

const SENSE_LIMIT = 3;
const SENTENCE_LIMIT = 2;

// Everything a word card needs. Returns null when the id does not exist.
export async function getWordStudyDetails(
  db: SQLiteDatabase,
  wordId: number,
): Promise<WordStudyDetails | null> {
  const word = await db.getFirstAsync<WordRow>("SELECT * FROM content.words WHERE id = ?", [
    wordId,
  ]);
  if (!word) return null;

  const senses = await db.getAllAsync<{ pos: string; glosses: string }>(
    "SELECT pos, glosses FROM content.senses WHERE word_id = ? ORDER BY position LIMIT ?",
    [wordId, SENSE_LIMIT],
  );
  // Shortest sentences first: they are the easiest to read.
  const sentences = await db.getAllAsync<SentenceRow>(
    `SELECT s.* FROM content.sentence_words sw
     JOIN content.sentences s ON s.id = sw.sentence_id
     WHERE sw.word_id = ? ORDER BY s.length LIMIT ?`,
    [wordId, SENTENCE_LIMIT],
  );

  const forms = {
    kanjiText: word.kanji_text,
    kanaText: word.kana_text,
    usuallyKana: word.usually_kana === 1,
  };
  return {
    id: word.id,
    displayForm: displayForm(forms),
    kanaText: word.kana_text,
    kanjiText: word.kanji_text,
    furigana: displayFurigana(
      forms,
      parseFurigana(word.furigana, word.kanji_text ?? word.kana_text),
    ),
    romaji: word.romaji,
    jlpt: word.jlpt,
    partsOfSpeech: parseStringList(senses[0]?.pos ?? null),
    glosses: senses.map((sense) => parseStringList(sense.glosses).join("; ")),
    sentences: sentences.map((sentence) => ({
      id: sentence.id,
      japanese: sentence.japanese,
      english: sentence.english,
      furigana: parseFurigana(sentence.furigana, sentence.japanese),
    })),
  };
}
