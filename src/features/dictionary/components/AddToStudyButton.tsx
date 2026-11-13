import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { WordStudyState } from "../api/studyQueue";
import { useWordStudyState } from "../hooks/useWordStudyState";

// The label for each study state. Only "none" is a button that can be pressed.
const LABELS: Record<WordStudyState, string> = {
  none: "Add to study",
  queued: "Queued ✓",
  learning: "Studying",
  known: "Known",
};

// A button that puts a word in the study queue and then shows where the word is.
export function AddToStudyButton({ wordId }: { wordId: number }) {
  const colors = useTheme();
  const { state, errorMessage, addToStudy } = useWordStudyState(wordId);

  if (state === null) {
    return <Text style={{ color: errorMessage ? colors.danger : colors.mutedText }}>…</Text>;
  }
  const canAdd = state === "none";

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={addToStudy}
        disabled={!canAdd}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canAdd }}
        style={({ pressed }) => [
          styles.button,
          { borderColor: colors.primary },
          canAdd && { backgroundColor: colors.primary },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.label, { color: canAdd ? colors.card : colors.primary }]}>
          {LABELS[state]}
        </Text>
      </Pressable>
      {errorMessage ? <Text style={{ color: colors.danger }}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4, alignItems: "flex-start" },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: "center",
  },
  pressed: { opacity: 0.6 },
  label: { fontSize: 16, fontWeight: "600" },
});
