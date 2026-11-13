import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// Parts of speech and the numbered meanings (one line per sense).
// maxMeanings lets the speaking card show only the first two.
type WordMeaningsProps = {
  partsOfSpeech: string[];
  glosses: string[];
  maxMeanings?: number;
};

export function WordMeanings({ partsOfSpeech, glosses, maxMeanings }: WordMeaningsProps) {
  const colors = useTheme();
  const shownGlosses = maxMeanings === undefined ? glosses : glosses.slice(0, maxMeanings);

  return (
    <View style={styles.container}>
      {partsOfSpeech.length > 0 ? (
        <Text style={[styles.pos, { color: colors.mutedText }]}>{partsOfSpeech.join(", ")}</Text>
      ) : null}
      {shownGlosses.map((gloss, index) => (
        // Senses never reorder, so the position is a stable key.
        <Text key={`${index}-${gloss}`} style={[styles.gloss, { color: colors.text }]}>
          {`${index + 1}. ${gloss}`}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, alignItems: "center" },
  pos: { fontSize: 13, fontStyle: "italic", textAlign: "center" },
  gloss: { fontSize: 18, textAlign: "center" },
});
