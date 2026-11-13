import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { StudyRating } from "../types";
import { GradeButtons } from "./GradeButtons";
import { StudyButton } from "./StudyButton";

// Shown after answering: right/wrong, the correct answer, optional extras (children),
// then the buttons that continue. A wrong answer continues as Again; "I was right" flips it.
type AnswerFeedbackProps = {
  isCorrect: boolean;
  correctAnswer: string;
  showHardEasy: boolean;
  onGrade: (rating: StudyRating) => void;
  onContinueAfterWrong: () => void;
  onMarkRight?: () => void;
  children?: ReactNode;
};

export function AnswerFeedback(props: AnswerFeedbackProps) {
  const { isCorrect, correctAnswer, showHardEasy, onGrade, onContinueAfterWrong } = props;
  const colors = useTheme();
  const verdictColor = isCorrect ? colors.primary : colors.danger;
  const verdictText = isCorrect ? "Correct" : "Not quite";

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Text style={[styles.verdict, { color: verdictColor }]}>{verdictText}</Text>
      <Text style={[styles.answer, { color: colors.text }]}>{correctAnswer}</Text>
      {props.children}
      {isCorrect ? (
        <GradeButtons showHardEasy={showHardEasy} onGrade={onGrade} />
      ) : (
        <View style={styles.wrongActions}>
          <StudyButton label="Next" onPress={onContinueAfterWrong} />
          {props.onMarkRight ? (
            <Pressable onPress={props.onMarkRight} accessibilityRole="button" style={styles.link}>
              <Text style={{ color: colors.mutedText }}>I was right</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  verdict: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  answer: { fontSize: 22, textAlign: "center" },
  wrongActions: { gap: 4 },
  link: { minHeight: 44, alignItems: "center", justifyContent: "center" },
});
