import type { PrerequisiteItem, PrerequisiteLookup } from "../types";

type BaseItem = { itemType: string; itemKey: string };

// Principle 5: teach a kanji when it shows up in a word, just before the word.
// For every word (in order) the output holds: new components, then the new kanji, then the word.
// Components that are teachable kanji themselves become kanji items (with their own parts first).
// Each word plus its prerequisites is one group. Groups are never split: when the next group
// would go over `limit` we stop, unless nothing is chosen yet (then the whole group is taken).
// Non-word items (kana, loanwords) pass through as groups of one. Pure, so it is easy to test.
export function expandWithPrerequisites<T extends BaseItem>(
  items: T[],
  lookup: PrerequisiteLookup,
  isIntroduced: (itemType: string, itemKey: string) => boolean,
  limit: number,
): (T | PrerequisiteItem)[] {
  // Everything already chosen in this batch, as "type:key", so nothing is queued twice.
  const queued = new Set<string>();
  const isKnown = (itemType: string, itemKey: string) =>
    isIntroduced(itemType, itemKey) || queued.has(`${itemType}:${itemKey}`);

  // Adds a kanji and its parts to `group` (parts first). `queued` also stops endless loops.
  const addKanji = (kanji: string, group: (T | PrerequisiteItem)[]) => {
    queued.add(`kanji:${kanji}`);
    for (const component of lookup.componentsOfKanji(kanji)) {
      if (component === kanji) continue;
      if (lookup.isTeachableKanji(component)) {
        if (!isKnown("kanji", component)) addKanji(component, group);
      } else if (!isKnown("component", component)) {
        queued.add(`component:${component}`);
        group.push({ itemType: "component", itemKey: component });
      }
    }
    group.push({ itemType: "kanji", itemKey: kanji });
  };

  const output: (T | PrerequisiteItem)[] = [];
  for (const item of items) {
    const group: (T | PrerequisiteItem)[] = [];
    if (item.itemType === "word") {
      for (const kanji of lookup.kanjiOfWord(item.itemKey)) {
        if (lookup.isTeachableKanji(kanji) && !isKnown("kanji", kanji)) addKanji(kanji, group);
      }
    }
    group.push(item);

    const fits = output.length + group.length <= limit;
    if (!fits && output.length > 0) break;
    output.push(...group);
    if (output.length >= limit) break;
  }
  return output;
}
