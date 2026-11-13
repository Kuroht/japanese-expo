import { StyleSheet, Text } from "react-native";

import { checkRomaji, findKanaEntry } from "@/features/kana";
import { useTheme } from "@/shared/hooks/useTheme";

import { useCardAnswer } from "../hooks/useCardAnswer";
import type { CardRow, StudyRating } from "../types";
import { AnswerFeedback } from "./AnswerFeedback";
import { CardLayout } from "./CardLayout";
import { RomajiInput } from "./RomajiInput";

// Shows a kana; the user types its romaji. Auto-graded: right = Good, wrong = Again.
type KanaRecognitionCardProps = {
  card: CardRow;
  showHardEasy: boolean;
  onGrade: (rating: StudyRating, durationMs: number) => void;
};

export function KanaRecognitionCard({ card, showHardEasy, onGrade }: KanaRecognitionCardProps) {
  const colors = useTheme();
  const answer = useCardAnswer(onGrade);
  const kana = card.item_key;
  const correctRomaji = findKanaEntry(kana)?.romaji ?? "";

  return (
    <CardLayout>
      <Text style={[styles.kana, { color: colors.text }]}>{kana}</Text>
      {answer.isCorrect === null ? (
        <RomajiInput onSubmit={(typedText) => answer.recordAnswer(checkRomaji(kana, typedText))} />
      ) : (
        <AnswerFeedback
          isCorrect={answer.isCorrect}
          correctAnswer={correctRomaji}
          showHardEasy={showHardEasy}
          onGrade={answer.grade}
          onContinueAfterWrong={answer.continueAfterWrong}
          onMarkRight={answer.markRight}
        />
      )}
    </CardLayout>
  );
}

const styles = StyleSheet.create({
  kana: { fontSize: 96, textAlign: "center" },
});
