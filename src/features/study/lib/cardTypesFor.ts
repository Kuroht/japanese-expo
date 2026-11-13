import type { CardType, ItemType } from "../types";

// The one place that decides which cards an item gets. Phase 2+ item types are added here.
// itemKey is passed too, so a later item type can vary its cards by key.
export function cardTypesFor(itemType: ItemType, _itemKey: string): CardType[] {
  if (itemType === "kana") return ["recognition", "reverse"];
  if (itemType === "loanword") return ["reading"];
  throw new Error(`No card types defined yet for item type "${itemType}"`);
}
