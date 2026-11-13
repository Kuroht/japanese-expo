import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { KanjiExampleWord } from "../types";

type KanjiExampleWordsProps = {
  words: KanjiExampleWord[];
  areStudied: boolean;
};

// Example words that use the kanji. Each row opens the word page.
// Nothing is shown when no word uses the kanji (the empty state is simply no section).
export function KanjiExampleWords({ words, areStudied }: KanjiExampleWordsProps) {
  const colors = useTheme();
  if (words.length === 0) return null;
  const title = areStudied ? "Words you've studied" : "Common words";

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.mutedText }]}>{title}</Text>
      {words.map((word) => (
        <Pressable
          key={word.id}
          onPress={() => router.push({ pathname: "/word/[id]", params: { id: String(word.id) } })}
          accessibilityRole="button"
          accessibilityLabel={`${word.displayForm}, ${word.kana}, ${word.firstGloss}`}
          style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.word, { color: colors.text }]}>{word.displayForm}</Text>
          <View style={styles.details}>
            <Text style={{ color: colors.mutedText }}>{word.kana}</Text>
            <Text style={{ color: colors.text }}>{word.firstGloss}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, alignSelf: "stretch" },
  title: { fontSize: 13, fontWeight: "600", textTransform: "uppercase" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 52,
  },
  word: { fontSize: 24 },
  details: { flex: 1 },
});
