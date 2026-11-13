import { cardTypesFor } from "./cardTypesFor";

describe("cardTypesFor", () => {
  it("gives kanji and components one meaning card", () => {
    expect(cardTypesFor("kanji", "休")).toEqual(["meaning"]);
    expect(cardTypesFor("component", "化")).toEqual(["meaning"]);
  });

  it("keeps the earlier item types unchanged", () => {
    expect(cardTypesFor("kana", "シ")).toEqual(["recognition", "reverse"]);
    expect(cardTypesFor("loanword", "コーヒー")).toEqual(["reading"]);
    expect(cardTypesFor("word", "1")).toEqual(["reading", "listening", "speaking"]);
  });
});
