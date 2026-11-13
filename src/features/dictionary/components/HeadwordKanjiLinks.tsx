import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { isKanji } from "wanakana";

import { useTheme } from "@/shared/hooks/useTheme";

// One tappable button per distinct kanji of the headword, opening that kanji's page.
// Kana and punctuation are skipped. Renders nothing for kana-only words.
export function HeadwordKanjiLinks({ headword }: { headword: string }) {
  const colors = useTheme();
  const kanjiChars = [...new Set([...headword].filter((char) => isKanji(char)))];
  if (kanjiChars.length === 0) return null;

  return (
    <View style={styles.row}>
      {kanjiChars.map((char) => (
        <Pressable
          key={char}
          onPress={() => router.push({ pathname: "/kanji/[char]", params: { char } })}
          accessibilityRole="button"
          accessibilityLabel={`Kanji ${char}`}
          style={[styles.button, { borderColor: colors.primary }]}
        >
          <Text style={[styles.char, { color: colors.primary }]}>{char}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: {
    minWidth: 44,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  char: { fontSize: 24 },
});
