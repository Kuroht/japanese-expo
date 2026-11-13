import { Linking, Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { creditSources, type CreditSource } from "../creditsData";

// One source: name, what it gives us, its licence. Tapping opens the source website.
function CreditRow({ source }: { source: CreditSource }) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={() => Linking.openURL(source.url)}
      accessibilityRole="link"
      accessibilityLabel={`${source.name}, ${source.license}. Opens the website.`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.name, { color: colors.text }]}>{source.name}</Text>
      <Text style={[styles.description, { color: colors.text }]}>{source.description}</Text>
      <Text
        style={[styles.license, { color: colors.mutedText }]}
      >{`Licence: ${source.license}`}</Text>
      <Text style={[styles.link, { color: colors.primary }]}>{source.url}</Text>
    </Pressable>
  );
}

// Lists every data source and its licence, as the licences require.
export function CreditsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      {creditSources.map((source) => (
        <CreditRow key={source.name} source={source} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10 },
  row: { borderWidth: 1, borderRadius: 8, padding: 12, gap: 4 },
  pressed: { opacity: 0.6 },
  name: { fontSize: 17, fontWeight: "600" },
  description: { fontSize: 14 },
  license: { fontSize: 13 },
  link: { fontSize: 13 },
});
