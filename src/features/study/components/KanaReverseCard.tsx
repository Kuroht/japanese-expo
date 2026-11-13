import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { findKanaEntry, reverseOptions } from "@/features/kana";
import { useTheme } from "@/shared/hooks/useTheme";

import { useCardAnswer } from "../hooks/useCardAnswer";
import type { CardRow, StudyRating } from "../types";
import { AnswerFeedback } from "./AnswerFeedback";
import { CardLayout } from "./CardLayout";

// Shows romaji; the user picks the matching kana out of 4. Auto-graded.
type KanaReverseCardProps = {
  card: CardRow;
  againCount: number;
  showHardEasy: boolean;
  onGrade: (rating: StudyRating, durationMs: number) => void;
};

export function KanaReverseCard({ card, againCount, showHardEasy, onGrade }: KanaReverseCardProps) {
  const colors = useTheme();
  const answer = useCardAnswer(onGrade);
  const [pickedKana, setPickedKana] = useState<string | null>(null);
  const correctKana = card.item_key;
  // The seed stays the same while this card is on screen, so the options never reshuffle.
  const [options] = useState(() => reverseOptions(correctKana, card.id * 10 + againCount));
  const romaji = findKanaEntry(correctKana)?.romaji ?? "";

  const handlePick = (kana: string) => {
    if (pickedKana !== null) return;
    setPickedKana(kana);
    answer.recordAnswer(kana === correctKana);
  };

  // After answering: the right option is highlighted, a wrong pick is marked in red.
  const borderFor = (kana: string) => {
    if (pickedKana === null) return colors.border;
    if (kana === correctKana) return colors.primary;
    if (kana === pickedKana) return colors.danger;
    return colors.border;
  };

  return (
    <CardLayout>
      <Text style={[styles.romaji, { color: colors.text }]}>{romaji}</Text>
      <View style={styles.grid}>
        {options.map((kana) => (
          <Pressable
            key={kana}
            onPress={() => handlePick(kana)}
            accessibilityRole="button"
            accessibilityLabel={kana}
            style={[styles.option, { backgroundColor: colors.card, borderColor: borderFor(kana) }]}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>{kana}</Text>
          </Pressable>
        ))}
      </View>
      {answer.isCorrect === null ? null : (
        <AnswerFeedback
          isCorrect={answer.isCorrect}
          correctAnswer={correctKana}
          showHardEasy={showHardEasy}
          onGrade={answer.grade}
          onContinueAfterWrong={answer.continueAfterWrong}
        />
      )}
    </CardLayout>
  );
}

const styles = StyleSheet.create({
  romaji: { fontSize: 56, textAlign: "center", fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  option: {
    width: "47%",
    flexGrow: 1,
    minHeight: 88,
    borderWidth: 3,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: { fontSize: 40 },
});
