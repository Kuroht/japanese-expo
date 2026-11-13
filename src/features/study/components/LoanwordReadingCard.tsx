import { StyleSheet, Text, View } from "react-native";

import { checkRomaji } from "@/features/kana";
import { AudioButton } from "@/shared/components/AudioButton";
import { useSpeech } from "@/shared/hooks/useSpeech";
import { useTheme } from "@/shared/hooks/useTheme";

import { useCardAnswer } from "../hooks/useCardAnswer";
import { useLoanwordDetails } from "../hooks/useLoanwordDetails";
import type { CardRow, StudyRating } from "../types";
import { AnswerFeedback } from "./AnswerFeedback";
import { CardLayout } from "./CardLayout";
import { RomajiInput } from "./RomajiInput";
import { SessionMessage } from "./SessionMessage";

// Shows a katakana word; the user types the whole reading. The meanings and the audio
// appear only AFTER answering, so they cannot give the answer away.
type LoanwordReadingCardProps = {
  card: CardRow;
  showHardEasy: boolean;
  onGrade: (rating: StudyRating, durationMs: number) => void;
};

export function LoanwordReadingCard({ card, showHardEasy, onGrade }: LoanwordReadingCardProps) {
  const colors = useTheme();
  const { speak } = useSpeech();
  const answer = useCardAnswer(onGrade);
  const { isLoading, errorMessage, details } = useLoanwordDetails(card.item_key);

  if (isLoading) return <SessionMessage isLoading message="Loading word…" />;
  if (errorMessage || !details) {
    return (
      <SessionMessage isError message="Could not load this word. Close the session to leave." />
    );
  }

  const handleSubmit = (typedText: string) => {
    const isCorrect = checkRomaji(details.kanaText, typedText);
    answer.recordAnswer(isCorrect);
    speak(details.kanaText);
  };

  return (
    <CardLayout>
      <Text style={[styles.word, { color: colors.text }]}>{details.kanaText}</Text>
      {answer.isCorrect === null ? (
        <RomajiInput onSubmit={handleSubmit} />
      ) : (
        <AnswerFeedback
          isCorrect={answer.isCorrect}
          correctAnswer={details.romaji ?? details.kanaText}
          showHardEasy={showHardEasy}
          onGrade={answer.grade}
          onContinueAfterWrong={answer.continueAfterWrong}
          onMarkRight={answer.markRight}
        >
          <View style={styles.meanings}>
            <Text style={[styles.meaningText, { color: colors.mutedText }]}>
              {details.glosses.join("; ")}
            </Text>
            <AudioButton label="Play pronunciation" onPress={() => speak(details.kanaText)} />
          </View>
        </AnswerFeedback>
      )}
    </CardLayout>
  );
}

const styles = StyleSheet.create({
  word: { fontSize: 48, textAlign: "center" },
  meanings: { alignItems: "center", gap: 4 },
  meaningText: { fontSize: 17, textAlign: "center" },
});
