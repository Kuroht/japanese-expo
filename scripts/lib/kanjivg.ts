// Reads one KanjiVG SVG and returns its viewBox and stroke paths in stroke order.
export type StrokePaths = { viewBox: string; paths: string[] };

// Pulls out the d="..." of every path with id="kvg:XXXXX-sN", sorted by N.
// Returns null if the file has no viewBox or no stroke paths.
export function extractStrokePaths(svgText: string): StrokePaths | null {
  const viewBoxMatch = /<svg[^>]*\sviewBox="([^"]+)"/.exec(svgText);
  if (!viewBoxMatch) return null;

  const strokes: { number: number; path: string }[] = [];
  for (const tagMatch of svgText.matchAll(/<path\b[^>]*>/g)) {
    const tag = tagMatch[0];
    const idMatch = /\bid="kvg:[0-9a-f]+-s(\d+)"/.exec(tag);
    const pathMatch = /\bd="([^"]+)"/.exec(tag);
    if (idMatch && pathMatch) {
      strokes.push({ number: Number(idMatch[1]), path: pathMatch[1] });
    }
  }
  if (strokes.length === 0) return null;

  strokes.sort((first, second) => first.number - second.number);
  return {
    viewBox: viewBoxMatch[1],
    paths: strokes.map((stroke) => stroke.path),
  };
}
