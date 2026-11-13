import type { SQLiteDatabase } from "expo-sqlite";

import type { PracticeSentenceSummary } from "../types";
import { KNOWN_WORD_IDS_SQL } from "./knownWords";

type FindOptions = {
  maxUnknown?: number;
  limit?: number;
  excludeIds?: number[];
};

// Days since 1970, so the "random" order changes once a day but not on every screen visit.
function todayNumber(): number {
  return Math.floor(Date.now() / 86_400_000);
}

// Finds sentences the user can mostly read: at most `maxUnknown` unknown words and at least 2
// known ones. Fewer unknown words come first, then shorter sentences (in bands of 10
// characters), then a hash of sentence id + today's date so the list differs from day to day.
export async function findPracticeSentences(
  db: SQLiteDatabase,
  options: FindOptions = {},
): Promise<PracticeSentenceSummary[]> {
  const { maxUnknown = 1, limit = 10, excludeIds = [] } = options;
  const excludeClause = excludeIds.length
    ? `AND s.id NOT IN (${excludeIds.map(() => "?").join(", ")})`
    : "";

  // known = the user's known word ids (MATERIALIZED: computed once, not per row).
  // candidates = sentences with at least 2 known words, found through the (word_id, sentence_id)
  // primary key, so we never scan all of sentence_words.
  // stats = adds each candidate's total word count (rows are distinct per sentence + word).
  const sql = `
    WITH known(word_id) AS MATERIALIZED (${KNOWN_WORD_IDS_SQL}),
    candidates AS (
      SELECT sw.sentence_id, COUNT(*) AS known_words
      FROM known
      JOIN content.sentence_words sw ON sw.word_id = known.word_id
      GROUP BY sw.sentence_id
      HAVING COUNT(*) >= 2
    ),
    stats AS (
      SELECT sentence_id, known_words,
        (SELECT COUNT(*) FROM content.sentence_words x WHERE x.sentence_id = candidates.sentence_id)
          AS total_words
      FROM candidates
    )
    SELECT s.id, s.japanese, s.english, stats.total_words - stats.known_words AS unknownCount
    FROM stats
    JOIN content.sentences s ON s.id = stats.sentence_id
    WHERE stats.total_words - stats.known_words <= ? ${excludeClause}
    ORDER BY unknownCount ASC, s.length / 10 ASC, (s.id * 1103 + ? * 7919) % 100003 ASC
    LIMIT ?`;
  return db.getAllAsync<PracticeSentenceSummary>(sql, [
    maxUnknown,
    ...excludeIds,
    todayNumber(),
    limit,
  ]);
}
