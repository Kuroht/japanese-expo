import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// Small badges next to a word: "N5" for the JLPT level and "common".
type WordTagsProps = {
  jlpt: number | null;
  isCommon: boolean;
};

function Tag({ label }: { label: string }) {
  const colors = useTheme();

  return (
    <View style={[styles.tag, { borderColor: colors.border }]}>
      <Text style={[styles.tagText, { color: colors.mutedText }]}>{label}</Text>
    </View>
  );
}

export function WordTags({ jlpt, isCommon }: WordTagsProps) {
  if (jlpt === null && !isCommon) return null;

  return (
    <View style={styles.row}>
      {jlpt === null ? null : <Tag label={`N${jlpt}`} />}
      {isCommon ? <Tag label="common" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  tag: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 12 },
});
