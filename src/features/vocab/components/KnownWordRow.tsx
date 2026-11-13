import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { VocabListRow } from "../types";

// One word in the "known words" list: a checkbox-like row with a status badge.
type KnownWordRowProps = {
  word: VocabListRow;
  isSelected: boolean;
  onToggle: (wordId: number) => void;
};

export function KnownWordRow({ word, isSelected, onToggle }: KnownWordRowProps) {
  const colors = useTheme();
  const showKana = word.kanaText !== word.displayForm;
  const badge = word.status === null ? null : word.status;

  return (
    <Pressable
      onPress={() => onToggle(word.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${word.displayForm}, ${word.firstGlosses.join(", ")}`}
      style={[
        styles.row,
        { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border },
      ]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: colors.primary,
            backgroundColor: isSelected ? colors.primary : "transparent",
          },
        ]}
      >
        {isSelected ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <View style={styles.text}>
        <Text style={[styles.word, { color: colors.text }]}>
          {showKana ? `${word.displayForm}  ${word.kanaText}` : word.displayForm}
        </Text>
        <Text style={{ color: colors.mutedText }} numberOfLines={2}>
          {word.firstGlosses.join("; ")}
        </Text>
      </View>
      {badge ? (
        <Text style={[styles.badge, { color: colors.mutedText, borderColor: colors.border }]}>
          {badge}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 56,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  check: { color: "#ffffff", fontWeight: "700" },
  text: { flex: 1, gap: 2 },
  word: { fontSize: 18 },
  badge: {
    fontSize: 12,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
