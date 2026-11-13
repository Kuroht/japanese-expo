import type { CardRow } from "../types";
import type { NewItemWithCards } from "./sessionQueue";

// Groups a flat list of cards into one entry per item. The items keep the order in which
// they first appear, so the caller controls the order with its SQL ORDER BY.
export function groupCardsByItem(cards: CardRow[]): NewItemWithCards[] {
  const groups = new Map<string, NewItemWithCards>();
  for (const card of cards) {
    const key = `${card.item_type}:${card.item_key}`;
    const existing = groups.get(key);
    if (existing) {
      existing.cards.push(card);
      continue;
    }
    const item = { itemType: card.item_type, itemKey: card.item_key };
    groups.set(key, { item, cards: [card] });
  }
  return [...groups.values()];
}
