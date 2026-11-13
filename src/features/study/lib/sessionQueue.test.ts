import { Rating } from "ts-fsrs";

import type { CardRow, ItemRef, SessionStep } from "../types";
import { newCardRow } from "./fsrs";
import { answerStep, buildQueue, finishIntro } from "./sessionQueue";

let nextId = 1;
function makeCard(key: string, cardType: CardRow["card_type"] = "recognition"): CardRow {
  return { ...newCardRow("kana", key, cardType, 0), id: nextId++ };
}

function cardKeys(queue: SessionStep[]): string[] {
  return queue.map((step) =>
    step.kind === "card" ? step.card.item_key : `intro:${step.item.itemKey}`,
  );
}

describe("buildQueue", () => {
  const reviews = Array.from({ length: 12 }, (_, index) => makeCard(`r${index}`));
  const newItems = ["A", "B"].map((key) => {
    const item: ItemRef = { itemType: "kana", itemKey: key };
    return { item, cards: [makeCard(key, "recognition"), makeCard(key, "reverse")] };
  });

  it("keeps every step and puts an intro before its cards", () => {
    const keys = cardKeys(buildQueue(reviews, newItems));
    expect(keys).toHaveLength(12 + 2 + 4);
    for (const key of ["A", "B"]) {
      const introAt = keys.indexOf(`intro:${key}`);
      const cardPositions = keys.flatMap((value, index) => (value === key ? [index] : []));
      expect(cardPositions).toHaveLength(2);
      for (const position of cardPositions) expect(position - introAt).toBeGreaterThanOrEqual(3);
    }
  });

  it("spreads the intros among the reviews", () => {
    const keys = cardKeys(buildQueue(reviews, newItems));
    expect(keys.indexOf("intro:A")).toBeGreaterThan(0);
    expect(keys.indexOf("intro:B")).toBeGreaterThan(keys.indexOf("intro:A") + 2);
  });

  it("works with only new items", () => {
    const keys = cardKeys(buildQueue([], newItems.slice(0, 1)));
    expect(keys).toEqual(["intro:A", "A", "A"]);
  });
});

describe("answerStep", () => {
  const queue = (): SessionStep[] =>
    ["a", "b", "c", "d", "e"].map((key) => ({ kind: "card", card: makeCard(key), againCount: 0 }));

  it("drops the card on Good", () => {
    expect(cardKeys(answerStep(queue(), Rating.Good))).toEqual(["b", "c", "d", "e"]);
  });

  it("re-inserts the card 3 steps later on Again", () => {
    expect(cardKeys(answerStep(queue(), Rating.Again))).toEqual(["b", "c", "d", "a", "e"]);
  });

  it("puts the card at the end when the queue is short", () => {
    const short = queue().slice(0, 2);
    expect(cardKeys(answerStep(short, Rating.Again))).toEqual(["b", "a"]);
  });

  it("uses the updated card when given", () => {
    const updated = { ...makeCard("a"), reps: 5 };
    const next = answerStep(queue(), Rating.Again, updated);
    const again = next.find((step) => step.kind === "card" && step.againCount === 1);
    expect(again?.kind === "card" && again.card.reps).toBe(5);
  });

  it("re-inserts a card at most 3 times", () => {
    let current: SessionStep[] = [{ kind: "card", card: makeCard("a"), againCount: 0 }];
    for (let attempt = 0; attempt < 3; attempt++) {
      current = answerStep(current, Rating.Again);
      expect(current).toHaveLength(1);
    }
    expect(answerStep(current, Rating.Again)).toHaveLength(0);
  });

  it("drops an intro with finishIntro", () => {
    const withIntro: SessionStep[] = [
      { kind: "intro", item: { itemType: "kana", itemKey: "A" } },
      ...queue(),
    ];
    expect(finishIntro(withIntro)).toHaveLength(5);
  });
});
