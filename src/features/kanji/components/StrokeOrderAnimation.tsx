import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { KanjiStrokeData } from "../types";
import { KanjiStrokes } from "./KanjiStrokes";

const MS_PER_STROKE = 700;

type StrokeOrderAnimationProps = {
  char: string;
  strokes: KanjiStrokeData | null;
  size?: number;
};

// Shows how to write a kanji: strokes appear one at a time, with a "Replay" button.
// Why a timer and not strokeDashoffset: the dash animation needs every path's length, which
// react-native-svg only reports through refs, and it behaves differently on Android.
// Revealing whole strokes on a timer needs no native details and always works.
export function StrokeOrderAnimation({ char, strokes, size = 200 }: StrokeOrderAnimationProps) {
  const colors = useTheme();
  const [visibleCount, setVisibleCount] = useState(0);
  const [replayCount, setReplayCount] = useState(0);
  const total = strokes?.paths.length ?? 0;

  // Adds one stroke per tick until all are shown. Replay resets the count in its click handler
  // (not here) and changes replayCount, which restarts this timer.
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((count) => Math.min(count + 1, total));
    }, MS_PER_STROKE);
    return () => clearInterval(timer);
  }, [total, replayCount]);

  const handleReplay = () => {
    setVisibleCount(0);
    setReplayCount((count) => count + 1);
  };

  // 51 kanji have no stroke data: show the plain character instead.
  if (!strokes || total === 0) {
    return <Text style={[styles.plain, { color: colors.text }]}>{char}</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.box, { borderColor: colors.border, width: size, height: size }]}>
        <KanjiStrokes strokes={strokes} size={size} visibleCount={visibleCount} />
      </View>
      <Pressable
        onPress={handleReplay}
        accessibilityRole="button"
        accessibilityLabel="Replay stroke order"
        style={({ pressed }) => [
          styles.replay,
          { borderColor: colors.primary },
          pressed && styles.dim,
        ]}
      >
        <Text style={{ color: colors.primary, fontWeight: "600" }}>Replay</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 8 },
  box: { borderWidth: 1, borderRadius: 12 },
  plain: { fontSize: 96, textAlign: "center" },
  replay: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
  },
  dim: { opacity: 0.5 },
});
