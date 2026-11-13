import { Rating, type Grade } from "ts-fsrs";

import type { CardRow, ItemRef, SessionStep } from "../types";

const MAX_AGAIN_PER_CARD = 3;
const AGAIN_DELAY_STEPS = 3;
const CARD_GAP_STEPS = 3; // a new item's card sits this many steps after its intro

export type NewItemWithCards = { item: ItemRef; cards: CardRow[] };

// Puts each intro at an even spot among the reviews (steps are immutable, we build a new list).
function placeIntros(reviews: CardRow[], intros: ItemRef[]): SessionStep[] {
  const steps: SessionStep[] = reviews.map((card) => ({ kind: "card", card, againCount: 0 }));
  intros.forEach((item, index) => {
    const spot = Math.floor(((index + 1) * reviews.length) / (intros.length + 1));
    steps.splice(spot + index, 0, { kind: "intro", item });
  });
  return steps;
}

// Builds the session order: reviews with new items spread among them.
// A new item's cards come 3 steps after its intro (and 3 apart), never back to back.
// If there are too few steps to wait for, the cards go to the end of the queue.
export function buildQueue(reviews: CardRow[], newItems: NewItemWithCards[]): SessionStep[] {
  const steps = placeIntros(
    reviews,
    newItems.map((entry) => entry.item),
  );
  for (const { item, cards } of newItems) {
    const introIndex = steps.findIndex(
      (step) =>
        step.kind === "intro" &&
        step.item.itemType === item.itemType &&
        step.item.itemKey === item.itemKey,
    );
    cards.forEach((card, cardIndex) => {
      const spot = Math.min(introIndex + CARD_GAP_STEPS * (cardIndex + 1), steps.length);
      steps.splice(spot, 0, { kind: "card", card, againCount: 0 });
    });
  }
  return steps;
}

// Handles the answer to the first step and returns the new queue.
// Again puts the card back 3 steps later (or at the end), at most 3 times per session.
// Pass updatedCard (the card returned by saveReview) so the re-shown card has its new state.
export function answerStep(
  queue: SessionStep[],
  rating: Grade,
  updatedCard?: CardRow,
): SessionStep[] {
  const [current, ...rest] = queue;
  if (!current || current.kind !== "card") return rest;
  if (rating !== Rating.Again || current.againCount >= MAX_AGAIN_PER_CARD) return rest;

  const again: SessionStep = {
    kind: "card",
    card: updatedCard ?? current.card,
    againCount: current.againCount + 1,
  };
  const spot = Math.min(AGAIN_DELAY_STEPS, rest.length);
  return [...rest.slice(0, spot), again, ...rest.slice(spot)];
}

// Drops the intro at the front once the user has read it ("Got it").
export function finishIntro(queue: SessionStep[]): SessionStep[] {
  return queue[0]?.kind === "intro" ? queue.slice(1) : queue;
}
