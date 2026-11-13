import { useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/shared/hooks/useTheme";

import { useWordSearch } from "../hooks/useWordSearch";
import { SearchResults } from "./SearchResults";

// The Dictionary tab: a search box with the results list below it.
export function DictionarySearchScreen() {
  const colors = useTheme();
  const [query, setQuery] = useState("");
  const search = useWordSearch(query);

  return (
    // The tab header already covers the top edge, so only pad the sides.
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <Text style={[styles.label, { color: colors.text }]} nativeID="search-label">
        Search the dictionary
      </Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Search the dictionary"
        accessibilityLabelledBy="search-label"
        placeholder="taberu, たべる, 食べる, eat"
        placeholderTextColor={colors.mutedText}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={[
          styles.input,
          { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
        ]}
      />
      <SearchResults query={query} search={search} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
  },
});
