import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { WordSense } from "../types";

// The numbered meanings of a word, each with its part of speech in small text.
export function SenseList({ senses }: { senses: WordSense[] }) {
  const colors = useTheme();

  return (
    <View style={styles.list}>
      {senses.map((sense, index) => (
        <View key={index} style={styles.sense}>
          {sense.partsOfSpeech.length > 0 ? (
            <Text style={[styles.partOfSpeech, { color: colors.mutedText }]}>
              {sense.partsOfSpeech.join(", ")}
            </Text>
          ) : null}
          <Text style={[styles.glosses, { color: colors.text }]}>
            {`${index + 1}. ${sense.glosses.join("; ")}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  sense: { gap: 2 },
  partOfSpeech: { fontSize: 12, fontStyle: "italic" },
  glosses: { fontSize: 16, lineHeight: 22 },
});
