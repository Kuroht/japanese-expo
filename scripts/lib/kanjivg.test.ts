import { extractStrokePaths } from "./kanjivg";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
<g id="kvg:StrokePaths_04e00"><g id="kvg:04e00" kvg:element="一">
<path id="kvg:04e00-s2" kvg:type="㇐" d="M3,3 L4,4"/>
<path id="kvg:04e00-s1" kvg:type="㇐" d="M1,1 L2,2"/>
</g></g>
<g id="kvg:StrokeNumbers_04e00"><text transform="matrix(1 0 0 1 4.25 14.5)">1</text></g>
</svg>`;

describe("extractStrokePaths", () => {
  it("returns the viewBox and paths sorted by stroke number", () => {
    expect(extractStrokePaths(svg)).toEqual({
      viewBox: "0 0 109 109",
      paths: ["M1,1 L2,2", "M3,3 L4,4"],
    });
  });

  it("returns null when there are no stroke paths", () => {
    expect(extractStrokePaths('<svg viewBox="0 0 1 1"></svg>')).toBeNull();
  });
});
