import { queueFirst } from "./queueFirst";

describe("queueFirst", () => {
  it("puts queued items first, then the others", () => {
    expect(queueFirst([5, 6], [1, 2, 3], 10)).toEqual([5, 6, 1, 2, 3]);
  });

  it("removes duplicates, keeping the queued position", () => {
    expect(queueFirst([2, 3], [1, 2, 3, 4], 10)).toEqual([2, 3, 1, 4]);
  });

  it("trims to the limit", () => {
    expect(queueFirst([9], [1, 2, 3], 2)).toEqual([9, 1]);
    expect(queueFirst([1, 2, 3], [4], 2)).toEqual([1, 2]);
  });

  it("handles empty lists and a zero limit", () => {
    expect(queueFirst([], [], 5)).toEqual([]);
    expect(queueFirst([1], [2], 0)).toEqual([]);
  });

  it("uses a key function for objects", () => {
    const result = queueFirst([{ id: 2 }], [{ id: 1 }, { id: 2 }], 5, (item) => item.id);
    expect(result).toEqual([{ id: 2 }, { id: 1 }]);
  });
});
