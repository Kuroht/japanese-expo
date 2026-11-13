import { pickComponentName, splitMissingNames } from "./componentNames";

const kangxi = new Map([["人", "man"]]);

describe("pickComponentName", () => {
  it("uses the Kangxi name when there is no custom name", () => {
    expect(pickComponentName("人", kangxi, {})).toEqual({ name: "man", source: "kangxi" });
  });

  it("lets components.json win over the Kangxi name", () => {
    expect(pickComponentName("人", kangxi, { 人: { name: "person" } })).toEqual({
      name: "person",
      source: "custom",
    });
  });

  it("returns null when no name exists", () => {
    expect(pickComponentName("ノ", kangxi, {})).toBeNull();
  });
});

describe("splitMissingNames", () => {
  it("makes missing names an error only for taught components", () => {
    const result = splitMissingNames(["ノ", "亀"], new Set(["ノ"]));
    expect(result).toEqual({ errors: ["ノ"], warnings: ["亀"] });
  });
});
