import type { SQLiteDatabase } from "expo-sqlite";

import type { ItemRef } from "../types";
import { markItemsKnown } from "./markItemsKnown";
import { unmarkItemsKnown } from "./unmarkItemsKnown";

// These live in study (not vocab) because study already imports vocab for new-item candidates,
// and vocab importing study back would be a circular import.
function toWordItems(wordIds: number[]): ItemRef[] {
  return wordIds.map((wordId) => ({ itemType: "word", itemKey: String(wordId) }));
}

// Bulk "I already know these words" (used by the vocab list).
export function markWordsKnown(db: SQLiteDatabase, wordIds: number[]): Promise<void> {
  return markItemsKnown(db, toWordItems(wordIds));
}

// Bulk undo: the words can be studied again.
export function unmarkWordsKnown(db: SQLiteDatabase, wordIds: number[]): Promise<void> {
  return unmarkItemsKnown(db, toWordItems(wordIds));
}
