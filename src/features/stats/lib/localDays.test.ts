import { countByLocalDay } from "./localDays";

describe("countByLocalDay", () => {
  const now = new Date(2026, 10, 13, 15, 0); // 13 Nov 2026, local time

  it("returns one entry per day, oldest first, with zero days", () => {
    const result = countByLocalDay([], 30, now);
    expect(result).toHaveLength(30);
    expect(result[0].date).toBe("2026-10-15");
    expect(result[29].date).toBe("2026-11-13");
    expect(result.every((entry) => entry.count === 0)).toBe(true);
  });

  it("buckets by local day and ignores reviews outside the window", () => {
    const lateTonight = new Date(2026, 10, 13, 23, 59).getTime();
    const justAfterMidnight = new Date(2026, 10, 12, 0, 1).getTime();
    const tooOld = new Date(2026, 9, 14, 12, 0).getTime();
    const result = countByLocalDay([lateTonight, justAfterMidnight, tooOld], 30, now);
    expect(result[29].count).toBe(1);
    expect(result[28].count).toBe(1);
    expect(result.reduce((sum, entry) => sum + entry.count, 0)).toBe(2);
  });
});
