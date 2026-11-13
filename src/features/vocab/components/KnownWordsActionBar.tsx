import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// Bottom bar: mark the selected words as known, and undo for the ones already known.
// Hidden while nothing is selected.
type KnownWordsActionBarProps = {
  selectedCount: number;
  canUnmark: boolean;
  isBusy: boolean;
  onMark: () => void;
  onUnmark: () => void;
};

export function KnownWordsActionBar(props: KnownWordsActionBarProps) {
  const colors = useTheme();
  if (props.selectedCount === 0) return null;

  return (
    <View style={[styles.bar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        onPress={props.onMark}
        disabled={props.isBusy}
        accessibilityRole="button"
        style={[styles.button, { backgroundColor: colors.primary }, props.isBusy && styles.dimmed]}
      >
        <Text style={styles.primaryLabel}>{`Mark ${props.selectedCount} selected as known`}</Text>
      </Pressable>
      {props.canUnmark ? (
        <Pressable
          onPress={props.onUnmark}
          disabled={props.isBusy}
          accessibilityRole="button"
          style={[styles.button, { borderColor: colors.primary }, props.isBusy && styles.dimmed]}
        >
          <Text style={[styles.secondaryLabel, { color: colors.primary }]}>Unmark</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1 },
  button: {
    flex: 1,
    minHeight: 48,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  dimmed: { opacity: 0.5 },
  primaryLabel: { color: "#ffffff", fontWeight: "600", fontSize: 16, textAlign: "center" },
  secondaryLabel: { fontWeight: "600", fontSize: 16 },
});
