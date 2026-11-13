import { StyleSheet, Text, View } from "react-native";

import { confusablePartners, findKanaEntry } from "@/features/kana";
import { useTheme } from "@/shared/hooks/useTheme";

// Intro content for a new kana: the character, its romaji, script, and look-alikes.
export function KanaIntro({ kana }: { kana: string }) {
  const colors = useTheme();
  const entry = findKanaEntry(kana);
  const partners = confusablePartners(kana).map(
    (partner) => `${partner} (${findKanaEntry(partner)?.romaji ?? "?"})`,
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.kana, { color: colors.text }]}>{kana}</Text>
      <Text style={[styles.romaji, { color: colors.text }]}>{entry?.romaji}</Text>
      <Text style={{ color: colors.mutedText }}>{entry?.script}</Text>
      {partners.length > 0 ? (
        <Text style={[styles.partners, { color: colors.mutedText }]}>
          {`Don't confuse with: ${partners.join(", ")}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 8 },
  kana: { fontSize: 120 },
  romaji: { fontSize: 36, fontWeight: "600" },
  partners: { fontSize: 16, textAlign: "center", marginTop: 12 },
});
