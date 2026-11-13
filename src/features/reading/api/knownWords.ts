// The ONE place that defines what "known" means for reading practice.
// Both the sentence finder and the sentence detail use these snippets.
//
// A known word: an items row of type 'word' or 'loanword' (loanword keys are also JMdict ids)
// with status 'known', OR status 'learning' with at least one reviewed card (reps >= 1).
export const KNOWN_WORD_IDS_SQL = `
  SELECT CAST(i.item_key AS INTEGER) AS word_id
  FROM items i
  WHERE i.item_type IN ('word', 'loanword')
    AND (
      i.status = 'known'
      OR (i.status = 'learning' AND EXISTS (
        SELECT 1 FROM cards c
        WHERE c.item_type = i.item_type AND c.item_key = i.item_key AND c.reps >= 1
      ))
    )`;

// A learned kanji: an items row of type 'kanji' that is known, or learning with a reviewed card.
export const LEARNED_KANJI_SQL = `
  SELECT i.item_key AS kanji
  FROM items i
  WHERE i.item_type = 'kanji'
    AND (
      i.status = 'known'
      OR (i.status = 'learning' AND EXISTS (
        SELECT 1 FROM cards c
        WHERE c.item_type = i.item_type AND c.item_key = i.item_key AND c.reps >= 1
      ))
    )`;
