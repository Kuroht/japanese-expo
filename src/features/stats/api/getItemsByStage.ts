import type { SQLiteDatabase } from "expo-sqlite";

import { itemStage } from "../lib/itemStage";
import { STAT_ITEM_TYPES } from "../types";
import type { ItemCardSummary, ItemsByStage, StatItemType } from "../types";

type SummaryRow = {
  item_type: string;
  status: string;
  card_count: number;
  learning_cards: number;
  review_cards: number;
  seen_cards: number;
  min_scheduled_days: number;
};

// Starts every type with all stages at zero.
function emptyCounts(): ItemsByStage {
  const result = {} as ItemsByStage;
  for (const itemType of STAT_ITEM_TYPES) {
    result[itemType] = { unseen: 0, learning: 0, young: 0, mature: 0, known: 0 };
  }
  return result;
}

// Counts items per type and stage. The database summarises each item's cards (one row per
// item); the pure itemStage() function then picks the stage.
export async function getItemsByStage(db: SQLiteDatabase): Promise<ItemsByStage> {
  const rows = await db.getAllAsync<SummaryRow>(
    `SELECT items.item_type, items.status,
            COUNT(cards.id) AS card_count,
            COALESCE(SUM(cards.state IN (1, 3)), 0) AS learning_cards,
            COALESCE(SUM(cards.state = 2), 0) AS review_cards,
            COALESCE(SUM(cards.reps > 0), 0) AS seen_cards,
            COALESCE(MIN(cards.scheduled_days), 0) AS min_scheduled_days
     FROM items
     LEFT JOIN cards ON cards.item_type = items.item_type AND cards.item_key = items.item_key
     GROUP BY items.item_type, items.item_key`,
  );

  const result = emptyCounts();
  for (const row of rows) {
    if (!STAT_ITEM_TYPES.includes(row.item_type as StatItemType)) continue;
    const summary: ItemCardSummary = {
      itemType: row.item_type,
      status: row.status,
      cardCount: row.card_count,
      learningCards: row.learning_cards,
      reviewCards: row.review_cards,
      seenCards: row.seen_cards,
      minScheduledDays: row.min_scheduled_days,
    };
    const stage = itemStage(summary);
    if (stage !== null) result[row.item_type as StatItemType][stage] += 1;
  }
  return result;
}
