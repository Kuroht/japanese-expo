import { StyleSheet, Text } from "react-native";

import { WordExamples, WordHeadword, WordMeanings, type WordStudyDetails } from "@/features/vocab";
import { useSpeech } from "@/shared/hooks/useSpeech";
import { useTheme } from "@/shared/hooks/useTheme";

import { useCardAnswer } from "../hooks/useCardAnswer";
import { useWordDetails } from "../hooks/useWordDetails";
import { RevealCardFrame } from "./RevealCardFrame";
import { SessionMessage } from "./SessionMessage";
import type { WordCardProps } from "./WordCardProps";

// Reading card: the headword WITHOUT furigana, so the user recalls the reading.
// "Show answer" reveals reading, meanings and an example, and plays the audio.
export function WordReadingCard(props: WordCardProps) {
  const { isLoading, errorMessage, details } = useWordDetails(Number(props.card.item_key));

  if (isLoading) return <SessionMessage isLoading message="Loading word…" />;
  if (errorMessage || !details) {
    return (
      <SessionMessage isError message="Could not load this word. Close the session to leave." />
    );
  }
  return <ReadingBody details={details} {...props} />;
}

function ReadingBody({
  details,
  showHardEasy,
  onGrade,
}: WordCardProps & { details: WordStudyDetails }) {
  const colors = useTheme();
  const { speak } = useSpeech();
  const answer = useCardAnswer(onGrade);

  // Reusing useCardAnswer: revealing counts as "answered" and stops the timer.
  const handleReveal = () => {
    answer.recordAnswer(true);
    speak(details.kanaText);
  };

  return (
    <RevealCardFrame
      prompt={
        <>
          <WordHeadword details={details} showFurigana={false} />
          <Text style={[styles.hint, { color: colors.mutedText }]}>How do you read it?</Text>
        </>
      }
      answer={
        <>
          <WordHeadword details={details} />
          <WordMeanings partsOfSpeech={details.partsOfSpeech} glosses={details.glosses} />
          <WordExamples sentences={details.sentences.slice(0, 1)} onPlay={speak} />
        </>
      }
      isRevealed={answer.isCorrect !== null}
      onReveal={handleReveal}
      showHardEasy={showHardEasy}
      onGrade={answer.grade}
    />
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15 },
});
