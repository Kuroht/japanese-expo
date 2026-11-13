import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { LoadState, WordSearchResult } from "../types";
import { WordResultRow } from "./WordResultRow";

// Shows what the search returned: hint, spinner, error, "no results" or the list.
type SearchResultsProps = {
  query: string;
  search: LoadState<WordSearchResult[]>;
};

function Message({ text, isError }: { text: string; isError?: boolean }) {
  const colors = useTheme();

  return (
    <View style={styles.message}>
      <Text style={{ color: isError ? colors.danger : colors.mutedText, fontSize: 16 }}>
        {text}
      </Text>
    </View>
  );
}

export function SearchResults({ query, search }: SearchResultsProps) {
  const colors = useTheme();

  if (!query.trim()) {
    return <Message text="Type Japanese, romaji or English to search." />;
  }
  if (search.errorMessage) {
    return <Message isError text={`Search failed: ${search.errorMessage}`} />;
  }
  if (search.data === null) {
    return <ActivityIndicator style={styles.message} color={colors.primary} />;
  }
  if (search.data.length === 0 && !search.isLoading) {
    return <Message text={`No results for "${query.trim()}".`} />;
  }

  return (
    <FlatList
      data={search.data}
      keyExtractor={(word) => String(word.id)}
      renderItem={({ item }) => <WordResultRow word={item} />}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: 8, paddingBottom: 24 },
  message: { paddingVertical: 24, alignItems: "center" },
});
