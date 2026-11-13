import type { SQLiteDatabase } from "expo-sqlite";
import { ALL_KANA_ENTRIES, kanaItemProvider } from "@/features/kana";
import { wordItemProvider } from "@/features/vocab";

import { mixCandidates } from "../lib/mixCandidates";
import type { ItemRef } from "../types";

// A provider suggests new items in the order they should be taught. It must not return more
// than `limit` items. isIntroduced tells it which items already exist in `items`.
export type NewItemProvider = (
  db: SQLiteDatabase,
  isIntroduced: (itemType: string, itemKey: string) => boolean,
  limit: number,
) => Promise<ItemRef[]>;

// Every item that already exists (learning, known or suspended), as "type:key" text.
async function loadExistingItemKeys(db: SQLiteDatabase): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ item_type: string; item_key: string }>(
    "SELECT item_type, item_key FROM items",
  );
  return new Set(rows.map((row) => `${row.item_type}:${row.item_key}`));
}

// True when every basic katakana already exists in `items` (learning or known).
function areBasicKatakanaDone(isIntroduced: (itemType: string, itemKey: string) => boolean) {
  return ALL_KANA_ENTRIES.filter(
    (entry) => entry.script === "katakana" && entry.group === "basic",
  ).every((entry) => isIntroduced("kana", entry.kana));
}

// The next items to teach, up to `limit`, skipping anything already in `items`.
// Two providers (kana + loanwords, and words) each suggest items; mixCandidates interleaves them.
export async function getNewItemCandidates(db: SQLiteDatabase, limit: number): Promise<ItemRef[]> {
  const existing = await loadExistingItemKeys(db);
  const isIntroduced = (itemType: string, itemKey: string) =>
    existing.has(`${itemType}:${itemKey}`);
  const notIntroduced = (item: ItemRef) => !isIntroduced(item.itemType, item.itemKey);

  const kanaList = (await kanaItemProvider(db, isIntroduced, limit)).filter(notIntroduced);
  const wordList = (await wordItemProvider(db, isIntroduced, limit)).filter(notIntroduced);
  return mixCandidates(kanaList, wordList, limit, areBasicKatakanaDone(isIntroduced));
}
