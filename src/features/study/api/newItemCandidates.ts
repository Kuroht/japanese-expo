import type { SQLiteDatabase } from "expo-sqlite";
import { kanaItemProvider } from "@/features/kana";

import type { ItemRef } from "../types";

// A provider suggests new items in the order they should be taught. It must not return more
// than `limit` items. isIntroduced tells it which items already exist in `items`.
export type NewItemProvider = (
  db: SQLiteDatabase,
  isIntroduced: (itemType: string, itemKey: string) => boolean,
  limit: number,
) => Promise<ItemRef[]>;

// Providers are asked in this order. To teach a new kind of item, add ONE line here.
const providers: NewItemProvider[] = [kanaItemProvider];

// Every item that already exists (learning, known or suspended), as "type:key" text.
async function loadExistingItemKeys(db: SQLiteDatabase): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ item_type: string; item_key: string }>(
    "SELECT item_type, item_key FROM items",
  );
  return new Set(rows.map((row) => `${row.item_type}:${row.item_key}`));
}

// The next items to teach, up to `limit`, skipping anything already in `items`.
export async function getNewItemCandidates(db: SQLiteDatabase, limit: number): Promise<ItemRef[]> {
  const existing = await loadExistingItemKeys(db);
  const isIntroduced = (itemType: string, itemKey: string) =>
    existing.has(`${itemType}:${itemKey}`);

  const candidates: ItemRef[] = [];
  for (const provider of providers) {
    const room = limit - candidates.length;
    if (room <= 0) break;
    const found = await provider(db, isIntroduced, room);
    candidates.push(...found.filter((item) => !isIntroduced(item.itemType, item.itemKey)));
  }
  return candidates.slice(0, limit);
}
