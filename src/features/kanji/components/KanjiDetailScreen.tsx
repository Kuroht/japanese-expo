import { router } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { useComponentDetails } from "../hooks/useComponentDetails";
import { useKanjiDetails } from "../hooks/useKanjiDetails";
import { ComponentInfo } from "./ComponentInfo";
import { KanjiInfo } from "./KanjiInfo";

// Opens the page of a character. Chips and "used in" kanji both go through here.
function openKanji(char: string) {
  router.push({ pathname: "/kanji/[char]", params: { char } });
}

// A centred message for loading, error and not-found.
function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

// Shown when the character is not a kanji we have: maybe it is a component (e.g. 亻).
function ComponentFallback({ char }: { char: string }) {
  const colors = useTheme();
  const { isLoading, errorMessage, details } = useComponentDetails(char);

  if (isLoading) return <ActivityIndicator color={colors.primary} style={styles.centered} />;
  if (errorMessage) {
    return (
      <Centered>
        <Text style={{ color: colors.danger }}>{`Could not load this: ${errorMessage}`}</Text>
      </Centered>
    );
  }
  if (!details) {
    return (
      <Centered>
        <Text style={{ color: colors.mutedText }}>This character was not found.</Text>
      </Centered>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.bigChar, { color: colors.text }]}>{details.char}</Text>
      <ComponentInfo details={details} onPressKanji={openKanji} />
    </ScrollView>
  );
}

// The kanji page: loading, error, the kanji itself, or the component fallback.
export function KanjiDetailScreen({ char }: { char: string }) {
  const colors = useTheme();
  const { isLoading, errorMessage, details, reload } = useKanjiDetails(char);

  if (isLoading) return <ActivityIndicator color={colors.primary} style={styles.centered} />;
  if (errorMessage) {
    return (
      <Centered>
        <Text style={{ color: colors.danger }}>{`Could not load this kanji: ${errorMessage}`}</Text>
      </Centered>
    );
  }
  if (!details) return <ComponentFallback char={char} />;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <KanjiInfo details={details} onMnemonicSaved={reload} onPressComponent={openKanji} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  content: { padding: 16, gap: 16, alignItems: "center" },
  bigChar: { fontSize: 96 },
});
