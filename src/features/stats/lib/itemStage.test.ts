import type { ItemCardSummary } from "../types";
import { itemStage } from "./itemStage";

// A two-card item in Review with a 30 day interval; tests override what they need.
function summary(overrides: Partial<ItemCardSummary>): ItemCardSummary {
  return {
    itemType: "word",
    status: "learning",
    cardCount: 2,
    learningCards: 0,
    reviewCards: 2,
    seenCards: 2,
    minScheduledDays: 30,
    ...overrides,
  };
}

describe("itemStage", () => {
  it("returns known for known items, whatever their cards say", () => {
    expect(itemStage(summary({ status: "known", learningCards: 1 }))).toBe("known");
  });

  it("returns null for suspended items", () => {
    expect(itemStage(summary({ status: "suspended" }))).toBeNull();
  });

  it("returns unseen when no card has been answered", () => {
    expect(itemStage(summary({ seenCards: 0, reviewCards: 0 }))).toBe("unseen");
  });

  it("returns learning when any card is in Learning or Relearning", () => {
    expect(itemStage(summary({ learningCards: 1, reviewCards: 1 }))).toBe("learning");
  });

  it("returns learning when one card is answered but another is still new", () => {
    expect(itemStage(summary({ reviewCards: 1, seenCards: 1 }))).toBe("learning");
  });

  it("returns young below 21 days, using the smallest interval", () => {
    expect(itemStage(summary({ minScheduledDays: 20 }))).toBe("young");
  });

  it("returns mature at 21 days or more", () => {
    expect(itemStage(summary({ minScheduledDays: 21 }))).toBe("mature");
  });
});
