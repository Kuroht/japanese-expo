import type { CardType, ItemType } from "../types";

// The one place that decides which cards an item gets. new item types are added here.
// itemKey is passed too, so a later item type can vary its cards by key.
export function cardTypesFor(itemType: ItemType, _itemKey: string): CardType[] {
  if (itemType === "kana") return ["recognition", "reverse"];
  if (itemType === "loanword") return ["reading"];
  // Words: read it, hear it, say it (all self-graded). Cards are keyed by item type too.
  if (itemType === "word") return ["reading", "listening", "speaking"];
  // Kanji: see it, recall the meaning (and a reading). Component: see it, recall its name.
  if (itemType === "kanji" || itemType === "component") return ["meaning"];
  throw new Error(`No card types defined yet for item type "${itemType}"`);
}
