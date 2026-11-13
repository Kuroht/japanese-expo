import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { useWordDetail } from "../hooks/useWordDetail";
import { WordDetailContent } from "./WordDetailContent";

// The word page. This component only decides between loading, error, not found and content.
export function WordDetailScreen({ wordId }: { wordId: number }) {
  const colors = useTheme();
  const { isLoading, errorMessage, data } = useWordDetail(wordId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.danger }}>{`Could not load this word: ${errorMessage}`}</Text>
      </View>
    );
  }
  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.mutedText }}>This word was not found.</Text>
      </View>
    );
  }
  return <WordDetailContent word={data} />;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
