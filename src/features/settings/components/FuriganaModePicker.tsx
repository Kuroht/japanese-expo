import { Pressable, StyleSheet, Text, View } from "react-native";

import type { FuriganaMode } from "@/features/reading";
import { useTheme } from "@/shared/hooks/useTheme";

const OPTIONS: { mode: FuriganaMode; label: string }[] = [
  { mode: "always", label: "Always" },
  { mode: "unlearned", label: "Only unlearned kanji" },
  { mode: "off", label: "Off" },
];

type FuriganaModePickerProps = {
  value: FuriganaMode;
  onChange: (mode: FuriganaMode) => void;
};

// Three radio rows for choosing when furigana is shown. The chosen row has a filled dot.
export function FuriganaModePicker({ value, onChange }: FuriganaModePickerProps) {
  const colors = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Furigana</Text>
      {OPTIONS.map((option) => {
        const isSelected = option.mode === value;
        return (
          <Pressable
            key={option.mode}
            onPress={() => onChange(option.mode)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            style={styles.option}
          >
            <View style={[styles.circle, { borderColor: colors.primary }]}>
              {isSelected ? (
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              ) : null}
            </View>
            <Text style={[styles.label, { color: colors.text }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  title: { fontSize: 17, paddingVertical: 8 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 17 },
});
