import { formatDuration } from "./formatDuration";

describe("formatDuration", () => {
  it("shows minutes only under an hour", () => {
    expect(formatDuration(0)).toBe("0 min");
    expect(formatDuration(45 * 60000)).toBe("45 min");
  });

  it("shows hours and minutes", () => {
    expect(formatDuration((3 * 60 + 20) * 60000)).toBe("3 h 20 min");
  });
});
