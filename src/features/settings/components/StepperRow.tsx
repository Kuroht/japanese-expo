import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// A setting with a number and − / + buttons. The value is kept between min and max.
type StepperRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

export function StepperRow({ label, value, min, max, step, onChange }: StepperRowProps) {
  const colors = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        onPress={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        style={[styles.button, value <= min && styles.dimmed]}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>−</Text>
      </Pressable>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        style={[styles.button, value >= max && styles.dimmed]}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
  },
  label: { flex: 1, fontSize: 17 },
  button: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 28 },
  dimmed: { opacity: 0.3 },
  value: { minWidth: 36, textAlign: "center", fontSize: 17 },
});
