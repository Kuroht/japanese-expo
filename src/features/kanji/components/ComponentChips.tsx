import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { KanjiComponentInfo } from "../types";

// The parts a kanji is built from, as small chips: the part and its name.
// Chips are only tappable when the screen passes onPressComponent (the detail screen does).
type ComponentChipsProps = {
  components: KanjiComponentInfo[];
  onPressComponent?: (char: string) => void;
};

export function ComponentChips({ components, onPressComponent }: ComponentChipsProps) {
  const colors = useTheme();

  return (
    <View style={styles.row}>
      {components.map((component) => (
        <Pressable
          key={component.char}
          disabled={!onPressComponent}
          onPress={() => onPressComponent?.(component.char)}
          accessibilityRole={onPressComponent ? "button" : "text"}
          accessibilityLabel={`${component.char}, ${component.name}`}
          style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.char, { color: colors.text }]}>{component.char}</Text>
          <Text style={[styles.name, { color: colors.mutedText }]}>{component.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  char: { fontSize: 22 },
  name: { fontSize: 14 },
});
