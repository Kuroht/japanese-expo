import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";

import { WordHeadword, WordMeanings, type WordStudyDetails } from "@/features/vocab";
import { AudioButton } from "@/shared/components/AudioButton";
import { NoJapaneseVoiceBanner } from "@/shared/components/NoJapaneseVoiceBanner";
import { useSpeech } from "@/shared/hooks/useSpeech";
import { useTheme } from "@/shared/hooks/useTheme";

import { useCardAnswer } from "../hooks/useCardAnswer";
import { useWordDetails } from "../hooks/useWordDetails";
import { RevealCardFrame } from "./RevealCardFrame";
import { SessionMessage } from "./SessionMessage";
import type { WordCardProps } from "./WordCardProps";

// Listening card: a big speaker button (plays once by itself, replay allowed).
// "Show answer" reveals the word, its reading and the meanings.
export function WordListeningCard(props: WordCardProps) {
  const { isLoading, errorMessage, details } = useWordDetails(Number(props.card.item_key));

  if (isLoading) return <SessionMessage isLoading message="Loading word…" />;
  if (errorMessage || !details) {
    return (
      <SessionMessage isError message="Could not load this word. Close the session to leave." />
    );
  }
  return <ListeningBody details={details} {...props} />;
}

function ListeningBody({
  details,
  showHardEasy,
  onGrade,
}: WordCardProps & { details: WordStudyDetails }) {
  const colors = useTheme();
  const { speak, hasJapaneseVoice } = useSpeech();
  const answer = useCardAnswer(onGrade);

  // Played once when the card appears (the card is re-created for every step).
  useEffect(() => {
    speak(details.kanaText);
  }, [details.kanaText, speak]);

  return (
    <RevealCardFrame
      prompt={
        <>
          <AudioButton label="Play word" size={72} onPress={() => speak(details.kanaText)} />
          <Text style={[styles.hint, { color: colors.mutedText }]}>What word is this?</Text>
          {hasJapaneseVoice === false ? <NoJapaneseVoiceBanner /> : null}
        </>
      }
      answer={
        <>
          <WordHeadword details={details} />
          <Text style={[styles.reading, { color: colors.text }]}>{details.kanaText}</Text>
          <WordMeanings partsOfSpeech={details.partsOfSpeech} glosses={details.glosses} />
        </>
      }
      isRevealed={answer.isCorrect !== null}
      onReveal={() => answer.recordAnswer(true)}
      showHardEasy={showHardEasy}
      onGrade={answer.grade}
    />
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15 },
  reading: { fontSize: 22 },
});
