import { StyleSheet, Text } from "react-native";

import { ComponentInfo, useComponentDetails, type ComponentDetails } from "@/features/kanji";
import { useTheme } from "@/shared/hooks/useTheme";

import { useCardAnswer } from "../hooks/useCardAnswer";
import { RevealCardFrame } from "./RevealCardFrame";
import { SessionMessage } from "./SessionMessage";
import type { WordCardProps } from "./WordCardProps";

// Meaning card for a component: the big component alone, then its name and "Used in".
export function ComponentMeaningCard(props: WordCardProps) {
  const { isLoading, errorMessage, details } = useComponentDetails(props.card.item_key);

  if (isLoading) return <SessionMessage isLoading message="Loading component…" />;
  if (errorMessage || !details) {
    return (
      <SessionMessage
        isError
        message="Could not load this component. Close the session to leave."
      />
    );
  }
  return <MeaningBody details={details} {...props} />;
}

function MeaningBody({
  details,
  showHardEasy,
  onGrade,
}: WordCardProps & { details: ComponentDetails }) {
  const colors = useTheme();
  const answer = useCardAnswer(onGrade);

  return (
    <RevealCardFrame
      prompt={<Text style={[styles.bigChar, { color: colors.text }]}>{details.char}</Text>}
      answer={<ComponentInfo details={details} />}
      isRevealed={answer.isCorrect !== null}
      onReveal={() => answer.recordAnswer(true)}
      showHardEasy={showHardEasy}
      onGrade={answer.grade}
    />
  );
}

const styles = StyleSheet.create({
  bigChar: { fontSize: 120 },
});
