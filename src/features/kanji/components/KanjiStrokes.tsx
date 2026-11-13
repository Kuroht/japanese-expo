import Svg, { Path } from "react-native-svg";

import { useTheme } from "@/shared/hooks/useTheme";

import type { KanjiStrokeData } from "../types";

// Draws the first `visibleCount` strokes of a kanji (all of them by default).
// The newest stroke is drawn in the accent colour so the user sees the stroke order.
type KanjiStrokesProps = {
  strokes: KanjiStrokeData;
  size: number;
  visibleCount?: number;
};

export function KanjiStrokes({ strokes, size, visibleCount }: KanjiStrokesProps) {
  const colors = useTheme();
  const count = visibleCount ?? strokes.paths.length;

  return (
    <Svg width={size} height={size} viewBox={strokes.viewBox}>
      {strokes.paths.slice(0, count).map((path, index) => (
        <Path
          // Strokes never reorder, so the position is a stable key.
          key={index}
          d={path}
          fill="none"
          stroke={index === count - 1 && visibleCount !== undefined ? colors.primary : colors.text}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
