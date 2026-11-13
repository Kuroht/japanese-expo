import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { ComponentDetails } from "../types";

type ComponentInfoProps = {
  details: ComponentDetails;
  // Set on the detail screen so the kanji can be tapped.
  onPressKanji?: (char: string) => void;
};

// A component's name and the kanji that use it ("Used in: 休 体 …").
export function ComponentInfo({ details, onPressKanji }: ComponentInfoProps) {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.name, { color: colors.text }]}>{details.name}</Text>
      {details.kanjiUsingIt.length > 0 ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.mutedText }]}>Used in:</Text>
          {details.kanjiUsingIt.map((kanji) => (
            <Pressable
              key={kanji.char}
              disabled={!onPressKanji}
              onPress={() => onPressKanji?.(kanji.char)}
              accessibilityRole={onPressKanji ? "button" : "text"}
              accessibilityLabel={`${kanji.char}, ${kanji.meaning}`}
              style={styles.kanjiButton}
            >
              <Text style={[styles.kanji, { color: colors.text }]}>{kanji.char}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, alignItems: "center" },
  name: { fontSize: 24, fontWeight: "600", textAlign: "center" },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  label: { fontSize: 16 },
  kanjiButton: { minWidth: 40, minHeight: 40, alignItems: "center", justifyContent: "center" },
  kanji: { fontSize: 28 },
});
