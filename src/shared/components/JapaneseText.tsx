import { StyleSheet, Text, View } from "react-native";

import type { FuriganaSegment } from "@/shared/db/types";
import { useTheme } from "@/shared/hooks/useTheme";

// Japanese text with small readings (furigana) above the kanji.
// Each segment is a column: reading on top, text below. Segments wrap like words.
type JapaneseTextProps = {
  segments: FuriganaSegment[];
  showFurigana?: boolean;
  fontSize?: number;
};

export function JapaneseText({ segments, showFurigana = true, fontSize = 20 }: JapaneseTextProps) {
  const colors = useTheme();
  const readingSize = Math.round(fontSize * 0.5);

  return (
    <View style={styles.row}>
      {segments.map((segment, index) => (
        // Segments never reorder, so the position is a stable key here.
        <View key={`${index}-${segment.text}`} style={styles.segment}>
          {showFurigana ? (
            <Text style={[styles.reading, { fontSize: readingSize, color: colors.mutedText }]}>
              {segment.reading ?? " "}
            </Text>
          ) : null}
          <Text style={{ fontSize, color: colors.text }}>{segment.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end" },
  segment: { alignItems: "center" },
  reading: { textAlign: "center" },
});
