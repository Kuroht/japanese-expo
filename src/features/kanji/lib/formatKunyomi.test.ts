import { formatKunyomi } from "./formatKunyomi";

describe("formatKunyomi", () => {
  it("puts okurigana in brackets", () => {
    expect(formatKunyomi("た.べる")).toBe("た(べる)");
  });

  it("leaves readings without okurigana alone", () => {
    expect(formatKunyomi("やま")).toBe("やま");
  });

  it("drops bound-form dashes", () => {
    expect(formatKunyomi("-ぎ.わ")).toBe("ぎ(わ)");
  });
});
