import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { formatKunyomi } from "../lib/formatKunyomi";

// On readings (katakana, as stored) and kun readings (formatted with the okurigana in brackets).
export function KanjiReadings({ onyomi, kunyomi }: { onyomi: string[]; kunyomi: string[] }) {
  const colors = useTheme();
  const onText = onyomi.join("、");
  const kunText = kunyomi.map(formatKunyomi).join("、");

  return (
    <View style={styles.container}>
      {onText ? (
        <Text style={[styles.reading, { color: colors.text }]}>
          <Text style={{ color: colors.mutedText }}>On: </Text>
          {onText}
        </Text>
      ) : null}
      {kunText ? (
        <Text style={[styles.reading, { color: colors.text }]}>
          <Text style={{ color: colors.mutedText }}>Kun: </Text>
          {kunText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  reading: { fontSize: 20 },
});
