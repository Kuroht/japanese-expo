import { StyleSheet, Text, View } from "react-native";

import { AudioButton } from "@/shared/components/AudioButton";
import { JapaneseText } from "@/shared/components/JapaneseText";
import { useTheme } from "@/shared/hooks/useTheme";

import type { WordExample } from "../types";

// Example sentences with furigana, a translation and a play button each.
type WordExamplesProps = {
  sentences: WordExample[];
  onPlay: (text: string) => void;
};

export function WordExamples({ sentences, onPlay }: WordExamplesProps) {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      {sentences.map((sentence) => (
        <View key={sentence.id} style={styles.row}>
          <View style={styles.text}>
            <JapaneseText segments={sentence.furigana} fontSize={18} />
            <Text style={[styles.english, { color: colors.mutedText }]}>{sentence.english}</Text>
          </View>
          <AudioButton label="Play sentence" onPress={() => onPlay(sentence.japanese)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, alignSelf: "stretch" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { flex: 1, gap: 4 },
  english: { fontSize: 14 },
});
