import type { SQLiteDatabase } from "expo-sqlite";

import { displayFurigana } from "@/shared/lib/displayForm";
import { parseFurigana, parseStringList } from "@/shared/lib/parseJson";
import type { SenseRow, SentenceRow, WordFormRow, WordRow } from "@/shared/db/types";

import type { WordDetail } from "../types";

const SENTENCE_LIMIT = 2;

// Loads one word with its forms, senses and up to 2 example sentences.
// Returns null when the id does not exist.
export async function getWordDetail(
  db: SQLiteDatabase,
  wordId: number,
): Promise<WordDetail | null> {
  const word = await db.getFirstAsync<WordRow>("SELECT * FROM content.words WHERE id = ?", [
    wordId,
  ]);
  if (!word) return null;

  const forms = await db.getAllAsync<WordFormRow>(
    "SELECT * FROM content.word_forms WHERE word_id = ? ORDER BY position",
    [wordId],
  );
  const senses = await db.getAllAsync<SenseRow>(
    "SELECT * FROM content.senses WHERE word_id = ? ORDER BY position",
    [wordId],
  );
  // Shortest sentences first: they are the easiest to read.
  const sentences = await db.getAllAsync<SentenceRow>(
    `SELECT s.* FROM content.sentence_words sw
     JOIN content.sentences s ON s.id = sw.sentence_id
     WHERE sw.word_id = ? ORDER BY s.length LIMIT ${SENTENCE_LIMIT}`,
    [wordId],
  );

  return {
    id: word.id,
    jlpt: word.jlpt,
    isCommon: word.is_common === 1,
    kanaText: word.kana_text,
    furigana: displayFurigana(
      {
        kanjiText: word.kanji_text,
        kanaText: word.kana_text,
        usuallyKana: word.usually_kana === 1,
      },
      parseFurigana(word.furigana, word.kanji_text ?? word.kana_text),
    ),
    forms: forms.map((form) => ({
      text: form.text,
      kind: form.kind,
      isCommon: form.is_common === 1,
    })),
    senses: senses.map((sense) => ({
      partsOfSpeech: parseStringList(sense.pos),
      glosses: parseStringList(sense.glosses),
    })),
    sentences: sentences.map((sentence) => ({
      id: sentence.id,
      japanese: sentence.japanese,
      english: sentence.english,
      furigana: parseFurigana(sentence.furigana, sentence.japanese),
    })),
  };
}
