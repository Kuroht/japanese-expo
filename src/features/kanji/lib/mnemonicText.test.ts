import { resolveMnemonic } from "./mnemonicText";

describe("resolveMnemonic", () => {
  it("prefers the user's edit", () => {
    expect(resolveMnemonic(" mine ", "default")).toEqual({ text: "mine", isEdited: true });
  });

  it("falls back to the default when there is no edit", () => {
    expect(resolveMnemonic(null, "default")).toEqual({ text: "default", isEdited: false });
  });

  it("treats a blank edit as no edit", () => {
    expect(resolveMnemonic("   ", "default")).toEqual({ text: "default", isEdited: false });
  });

  it("returns null text when nothing exists", () => {
    expect(resolveMnemonic(undefined, undefined)).toEqual({ text: null, isEdited: false });
  });
});
