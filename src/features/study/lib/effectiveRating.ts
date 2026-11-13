import { Rating, type Grade } from "ts-fsrs";
import { isHiragana } from "wanakana";

import type { CardFields, ItemType } from "../types";

// Hiragana is already known, so it should graduate fast: a Good on the very first review
// of a hiragana card counts as Easy. Everything else is graded as the user answered.
export function effectiveRating(
  itemType: ItemType,
  itemKey: string,
  card: CardFields,
  rating: Grade,
): Grade {
  const isFirstReview = card.reps === 0;
  const isHiraganaKana = itemType === "kana" && isHiragana(itemKey);
  if (rating === Rating.Good && isFirstReview && isHiraganaKana) return Rating.Easy;
  return rating;
}
