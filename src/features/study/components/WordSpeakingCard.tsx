import { StyleSheet, Text } from "react-native";

import { WordHeadword, WordMeanings, type WordStudyDetails } from "@/features/vocab";
import { useSpeech } from "@/shared/hooks/useSpeech";
import { useTheme } from "@/shared/hooks/useTheme";

import { useCardAnswer } from "../hooks/useCardAnswer";
import { useWordDetails } from "../hooks/useWordDetails";
import { RevealCardFrame } from "./RevealCardFrame";
import { SessionMessage } from "./SessionMessage";
import type { WordCardProps } from "./WordCardProps";

// Speaking card: the English meanings, the user says the word out loud.
// "Show answer" reveals the headword with furigana and plays the audio.
export function WordSpeakingCard(props: WordCardProps) {
  const { isLoading, errorMessage, details } = useWordDetails(Number(props.card.item_key));

  if (isLoading) return <SessionMessage isLoading message="Loading word…" />;
  if (errorMessage || !details) {
    return (
      <SessionMessage isError message="Could not load this word. Close the session to leave." />
    );
  }
  return <SpeakingBody details={details} {...props} />;
}

function SpeakingBody({
  details,
  showHardEasy,
  onGrade,
}: WordCardProps & { details: WordStudyDetails }) {
  const colors = useTheme();
  const { speak } = useSpeech();
  const answer = useCardAnswer(onGrade);

  const handleReveal = () => {
    answer.recordAnswer(true);
    speak(details.kanaText);
  };

  return (
    <RevealCardFrame
      prompt={
        <>
          <WordMeanings
            partsOfSpeech={details.partsOfSpeech}
            glosses={details.glosses}
            maxMeanings={2}
          />
          <Text style={[styles.hint, { color: colors.mutedText }]}>Say it out loud</Text>
        </>
      }
      answer={<WordHeadword details={details} />}
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
