import type { SQLiteDatabase } from "expo-sqlite";

import { displayForm } from "@/shared/lib/displayForm";

import { TEACHABLE_JLPT_LEVELS } from "../lib/teachableKanji";
import type { PrerequisiteLookup } from "../types";

type WordFormRow = {
  id: number;
  kanji_text: string | null;
  kana_text: string;
  usually_kana: number | null;
};
type ComponentRow = { kanji: string; component: string | null };

// The kanji characters of a headword, in order. Kana-only headwords give [].
function kanjiOf(headword: string): string[] {
  return [...headword].filter((char) => /\p{Script=Han}/u.test(char));
}

// Builds the lookup that expandWithPrerequisites needs, with two plain queries
// (no transaction, because `content` is attached on the main connection):
// 1. the written form of the given word items, 2. the components of every teachable kanji.
export async function kanjiLookup(
  db: SQLiteDatabase,
  items: { itemType: string; itemKey: string }[],
): Promise<PrerequisiteLookup> {
  const wordIds = items
    .filter((item) => item.itemType === "word")
    .map((item) => Number(item.itemKey));
  const kanjiByWord = new Map<string, string[]>();
  if (wordIds.length > 0) {
    const marks = wordIds.map(() => "?").join(", ");
    const words = await db.getAllAsync<WordFormRow>(
      `SELECT id, kanji_text, kana_text, usually_kana FROM content.words WHERE id IN (${marks})`,
      wordIds,
    );
    for (const word of words) {
      // The same rule as the word card headword: usually-kana words show kana, so no kanji.
      const headword = displayForm({
        kanjiText: word.kanji_text,
        kanaText: word.kana_text,
        usuallyKana: word.usually_kana === 1,
      });
      kanjiByWord.set(String(word.id), kanjiOf(headword));
    }
  }

  // Only ~245 kanji are teachable, so loading all their components at once is cheap.
  // LEFT JOIN keeps teachable kanji that have no components.
  const levelMarks = TEACHABLE_JLPT_LEVELS.map(() => "?").join(", ");
  const rows = await db.getAllAsync<ComponentRow>(
    `SELECT k.char AS kanji, kc.component AS component
     FROM content.kanji k
     LEFT JOIN content.kanji_components kc ON kc.kanji = k.char
     WHERE k.jlpt IN (${levelMarks})
     ORDER BY k.char, kc.position`,
    TEACHABLE_JLPT_LEVELS,
  );
  const componentsByKanji = new Map<string, string[]>();
  for (const row of rows) {
    const list = componentsByKanji.get(row.kanji) ?? [];
    if (row.component) list.push(row.component);
    componentsByKanji.set(row.kanji, list);
  }

  return {
    kanjiOfWord: (wordId) => kanjiByWord.get(wordId) ?? [],
    componentsOfKanji: (kanji) => componentsByKanji.get(kanji) ?? [],
    isTeachableKanji: (char) => componentsByKanji.has(char),
  };
}
