import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// Level switch (N5 / N4) and a labelled search box for the known-words screen.
type KnownWordsFiltersProps = {
  jlpt: number;
  search: string;
  onChangeJlpt: (jlpt: number) => void;
  onChangeSearch: (search: string) => void;
};

const LEVELS = [5, 4];

export function KnownWordsFilters(props: KnownWordsFiltersProps) {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.segments} accessibilityRole="tablist">
        {LEVELS.map((level) => {
          const isActive = level === props.jlpt;
          return (
            <Pressable
              key={level}
              onPress={() => props.onChangeJlpt(level)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.segment,
                {
                  borderColor: colors.primary,
                  backgroundColor: isActive ? colors.primary : "transparent",
                },
              ]}
            >
              <Text style={{ color: isActive ? "#ffffff" : colors.primary, fontWeight: "600" }}>
                {`N${level}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.label, { color: colors.mutedText }]}>Search words</Text>
      <TextInput
        value={props.search}
        onChangeText={props.onChangeSearch}
        placeholder="Kanji, kana, romaji or English"
        placeholderTextColor={colors.mutedText}
        accessibilityLabel="Search words"
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, padding: 16, paddingBottom: 8 },
  segments: { flexDirection: "row", gap: 8 },
  segment: {
    flex: 1,
    minHeight: 44,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 13 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, minHeight: 44, fontSize: 16 },
});
