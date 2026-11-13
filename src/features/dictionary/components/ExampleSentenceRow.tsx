import { StyleSheet, Text, View } from "react-native";

import { AudioButton } from "@/shared/components/AudioButton";
import { JapaneseText } from "@/shared/components/JapaneseText";
import { useTheme } from "@/shared/hooks/useTheme";

import type { ExampleSentence } from "../types";

// One example sentence: furigana Japanese, the English line and a play button.
type ExampleSentenceRowProps = {
  sentence: ExampleSentence;
  onPlay: (text: string) => void;
};

export function ExampleSentenceRow({ sentence, onPlay }: ExampleSentenceRowProps) {
  const colors = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <JapaneseText segments={sentence.furigana} fontSize={18} />
        <Text style={[styles.english, { color: colors.mutedText }]}>{sentence.english}</Text>
      </View>
      <AudioButton label="Play sentence" onPress={() => onPlay(sentence.japanese)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { flex: 1, gap: 4 },
  english: { fontSize: 14 },
});
