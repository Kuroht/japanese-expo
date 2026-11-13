import type { SQLiteDatabase } from "expo-sqlite";
import { queueFirst } from "@/features/dictionary";
import { ALL_KANA_ENTRIES, kanaItemProvider } from "@/features/kana";
import { expandWithPrerequisites, kanjiLookup } from "@/features/kanji";
import { wordItemProvider } from "@/features/vocab";

import { mixCandidates } from "../lib/mixCandidates";
import type { ItemRef, ItemType } from "../types";

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

// The items waiting in study_queue (added by hand), oldest first.
async function loadQueuedItems(db: SQLiteDatabase): Promise<ItemRef[]> {
  const rows = await db.getAllAsync<{ item_type: string; item_key: string }>(
    "SELECT item_type, item_key FROM study_queue ORDER BY added_at",
  );
  return rows.map((row) => ({ itemType: row.item_type as ItemType, itemKey: row.item_key }));
}

// The "type:key" text that identifies an item, used to remove duplicates.
function itemKeyOf(item: ItemRef): string {
  return `${item.itemType}:${item.itemKey}`;
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
  const mixedProviders = mixCandidates(
    kanaList,
    wordList,
    limit,
    areBasicKatakanaDone(isIntroduced),
  );

  // Words I added myself ("Add to study" in the dictionary or reading) always come first.
  const queued = (await loadQueuedItems(db)).filter(notIntroduced);
  const mixed = queueFirst(queued, mixedProviders, limit, itemKeyOf);

  // Phase 3: put each new word's kanji (and their components) just before the word.
  // Kana and loanword items pass through. The result is trimmed to `limit` without
  // splitting a word from its prerequisites.
  const lookup = await kanjiLookup(db, mixed);
  return expandWithPrerequisites(mixed, lookup, isIntroduced, limit);
}
