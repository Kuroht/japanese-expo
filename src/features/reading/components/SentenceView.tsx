import { StyleSheet, View } from "react-native";

import type { FuriganaMode, PracticeToken } from "../types";
import { shouldShowFurigana } from "../lib/furigana";
import { SentenceToken } from "./SentenceToken";

type SentenceViewProps = {
  tokens: PracticeToken[];
  furiganaMode: FuriganaMode;
  onTokenPress: (token: PracticeToken) => void;
};

// The sentence as a wrapping row of tokens, each with furigana decided by the user's setting.
export function SentenceView({ tokens, furiganaMode, onTokenPress }: SentenceViewProps) {
  return (
    <View style={styles.row}>
      {tokens.map((token, index) => (
        // Tokens never reorder, so the position is a stable key here.
        <SentenceToken
          key={`${index}-${token.surface}`}
          token={token}
          showFurigana={shouldShowFurigana(token, furiganaMode)}
          reserveReadingLine={furiganaMode !== "off"}
          onPress={onTokenPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", rowGap: 8 },
});
