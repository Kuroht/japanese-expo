// The ONE place that defines what "known" means for reading practice.
// Both the sentence finder and the sentence detail use these snippets.
//
// A known word: an items row of type 'word' or 'loanword' (loanword keys are also JMdict ids)
// with status 'known', OR status 'learning' with at least one card in FSRS state 2 (Review),
// meaning it survived its learning steps (a card that is only Learning/Relearning is not known).
export const KNOWN_WORD_IDS_SQL = `
  SELECT CAST(i.item_key AS INTEGER) AS word_id
  FROM items i
  WHERE i.item_type IN ('word', 'loanword')
    AND (
      i.status = 'known'
      OR (i.status = 'learning' AND EXISTS (
        SELECT 1 FROM cards c
        WHERE c.item_type = i.item_type AND c.item_key = i.item_key AND c.state = 2
      ))
    )`;

// A learned kanji: an items row of type 'kanji' that is known, or learning with a card in
// FSRS state 2 (Review), the same rule as for words.
export const LEARNED_KANJI_SQL = `
  SELECT i.item_key AS kanji
  FROM items i
  WHERE i.item_type = 'kanji'
    AND (
      i.status = 'known'
      OR (i.status = 'learning' AND EXISTS (
        SELECT 1 FROM cards c
        WHERE c.item_type = i.item_type AND c.item_key = i.item_key AND c.state = 2
      ))
    )`;
