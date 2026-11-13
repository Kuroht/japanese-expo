import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { WordSearchResult } from "../types";
import { WordTags } from "./WordTags";

// One search result: headword, reading, first meanings and tags. Tap opens the word.
type WordResultRowProps = {
  word: WordSearchResult;
};

export function WordResultRow({ word }: WordResultRowProps) {
  const colors = useTheme();
  const headword = word.kanjiText ?? word.kanaText;
  const showReading = word.kanjiText !== null;
  const meanings = word.firstGlosses.join("; ");

  const openWord = () => router.push({ pathname: "/word/[id]", params: { id: String(word.id) } });

  return (
    <Pressable
      onPress={openWord}
      accessibilityRole="button"
      accessibilityLabel={`${headword}, ${meanings}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.headRow}>
        <Text style={[styles.headword, { color: colors.text }]}>{headword}</Text>
        {showReading ? (
          <Text style={[styles.reading, { color: colors.mutedText }]}>{word.kanaText}</Text>
        ) : null}
      </View>
      <Text style={[styles.meanings, { color: colors.text }]} numberOfLines={2}>
        {meanings}
      </Text>
      <WordTags jlpt={word.jlpt} isCommon={word.isCommon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { borderWidth: 1, borderRadius: 8, padding: 12, gap: 6 },
  pressed: { opacity: 0.6 },
  headRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  headword: { fontSize: 22 },
  reading: { fontSize: 15 },
  meanings: { fontSize: 15 },
});
