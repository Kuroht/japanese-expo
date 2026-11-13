import { StyleSheet, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// A thin bar: steps done out of steps done + steps left (re-inserted cards make it grow a bit).
type SessionProgressProps = { stepsDone: number; stepsLeft: number };

export function SessionProgress({ stepsDone, stepsLeft }: SessionProgressProps) {
  const colors = useTheme();
  const total = stepsDone + stepsLeft;
  const percent = total === 0 ? 0 : Math.round((stepsDone / total) * 100);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.track, { backgroundColor: colors.border }]}
    >
      <View style={[styles.fill, { width: `${percent}%`, backgroundColor: colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
});
