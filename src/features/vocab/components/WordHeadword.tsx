import { StyleSheet, Text, View } from "react-native";

import { JapaneseText } from "@/shared/components/JapaneseText";
import { useTheme } from "@/shared/hooks/useTheme";

import type { WordStudyDetails } from "../types";

// The big headword. showFurigana=false hides the readings so a card can test them.
// Romaji and the JLPT tag are optional extras for the intro.
type WordHeadwordProps = {
  details: WordStudyDetails;
  showFurigana?: boolean;
  showRomaji?: boolean;
  showJlpt?: boolean;
};

export function WordHeadword({
  details,
  showFurigana = true,
  showRomaji = false,
  showJlpt = false,
}: WordHeadwordProps) {
  const colors = useTheme();
  // Without furigana we show the plain headword as one segment.
  const segments = showFurigana ? details.furigana : [{ text: details.displayForm }];

  return (
    <View style={styles.container}>
      <JapaneseText segments={segments} showFurigana={showFurigana} fontSize={48} />
      {showRomaji && details.romaji ? (
        <Text style={[styles.romaji, { color: colors.mutedText }]}>{details.romaji}</Text>
      ) : null}
      {showJlpt && details.jlpt !== null ? (
        <View style={[styles.tag, { borderColor: colors.border }]}>
          <Text style={[styles.tagText, { color: colors.mutedText }]}>{`N${details.jlpt}`}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 6 },
  romaji: { fontSize: 20 },
  tag: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 12 },
});
