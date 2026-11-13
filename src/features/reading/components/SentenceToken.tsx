import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { PracticeToken } from "../types";

type SentenceTokenProps = {
  token: PracticeToken;
  showFurigana: boolean;
  // false when furigana is switched off, so no empty line is kept above the word.
  reserveReadingLine: boolean;
  onPress: (token: PracticeToken) => void;
};

// One word of the sentence: reading above, text below. Words from the dictionary can be tapped.
// Unknown words are underlined and coloured. Particles and punctuation (no wordId) are never
// marked, because they are not vocabulary to learn.
export function SentenceToken({
  token,
  showFurigana,
  reserveReadingLine,
  onPress,
}: SentenceTokenProps) {
  const colors = useTheme();
  const isUnknown = token.wordId !== null && !token.isKnownWord;
  const readingText = showFurigana && token.reading !== token.surface ? token.reading : " ";

  const content = (
    <View style={styles.token}>
      {reserveReadingLine ? (
        <Text style={[styles.reading, { color: colors.mutedText }]}>{readingText}</Text>
      ) : null}
      <Text
        style={[
          styles.surface,
          { color: isUnknown ? colors.primary : colors.text },
          isUnknown && styles.underline,
        ]}
      >
        {token.surface}
      </Text>
    </View>
  );

  if (token.wordId === null) return content;
  return (
    <Pressable
      onPress={() => onPress(token)}
      accessibilityRole="button"
      accessibilityLabel={`${token.surface}, ${token.reading}`}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  token: { alignItems: "center" },
  reading: { fontSize: 11, textAlign: "center" },
  surface: { fontSize: 26 },
  underline: { textDecorationLine: "underline" },
});
