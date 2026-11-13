import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

const MIN_RATE = 0.5;
const MAX_RATE = 1.2;
const STEP = 0.1;

// − / + buttons for the shadowing speed, in 0.1 steps between 0.5 and 1.2.
export function ShadowRateControl({
  rate,
  onChange,
}: {
  rate: number;
  onChange: (rate: number) => void;
}) {
  const colors = useTheme();
  // Round to one decimal, because 0.9 + 0.1 is not exactly 1 in floating point maths.
  const change = (amount: number) => onChange(Math.round((rate + amount) * 10) / 10);
  const canDecrease = rate - STEP >= MIN_RATE - 0.001;
  const canIncrease = rate + STEP <= MAX_RATE + 0.001;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.text }]}>Speed</Text>
      <Pressable
        onPress={() => change(-STEP)}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel="Slower"
        style={[styles.button, !canDecrease && styles.dimmed]}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>−</Text>
      </Pressable>
      <Text style={[styles.value, { color: colors.text }]}>{rate.toFixed(1)}×</Text>
      <Pressable
        onPress={() => change(STEP)}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel="Faster"
        style={[styles.button, !canIncrease && styles.dimmed]}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  label: { flex: 1, fontSize: 16 },
  button: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 28 },
  dimmed: { opacity: 0.3 },
  value: { minWidth: 48, textAlign: "center", fontSize: 16 },
});
