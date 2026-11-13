import { newCardRow } from "./fsrs";
import { groupCardsByItem } from "./groupCardsByItem";

const card = (key: string, cardType: "reading" | "listening", id: number) => ({
  ...newCardRow("word", key, cardType, 0),
  id,
});

describe("groupCardsByItem", () => {
  it("groups cards per item and keeps the first-seen order", () => {
    const rows = [card("b", "reading", 1), card("a", "reading", 2), card("b", "listening", 3)];
    const groups = groupCardsByItem(rows);
    expect(groups.map((group) => group.item.itemKey)).toEqual(["b", "a"]);
    expect(groups[0].cards.map((row) => row.id)).toEqual([1, 3]);
  });

  it("returns an empty list for no cards", () => {
    expect(groupCardsByItem([])).toEqual([]);
  });
});
