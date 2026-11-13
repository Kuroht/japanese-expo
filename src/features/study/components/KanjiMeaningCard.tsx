import { StyleSheet, Text } from "react-native";

import { KanjiInfo, useKanjiDetails, type KanjiDetails } from "@/features/kanji";
import { useTheme } from "@/shared/hooks/useTheme";

import { useCardAnswer } from "../hooks/useCardAnswer";
import { RevealCardFrame } from "./RevealCardFrame";
import { SessionMessage } from "./SessionMessage";
import type { WordCardProps } from "./WordCardProps";

// Meaning card: the big kanji alone. "Show answer" reveals meanings, readings, parts,
// mnemonic and stroke order. The user grades themself (Again / Good, or all four).
export function KanjiMeaningCard(props: WordCardProps) {
  const { isLoading, errorMessage, details, reload } = useKanjiDetails(props.card.item_key);

  if (isLoading) return <SessionMessage isLoading message="Loading kanji…" />;
  if (errorMessage || !details) {
    return (
      <SessionMessage isError message="Could not load this kanji. Close the session to leave." />
    );
  }
  return <MeaningBody details={details} onMnemonicSaved={reload} {...props} />;
}

function MeaningBody({
  details,
  onMnemonicSaved,
  showHardEasy,
  onGrade,
}: WordCardProps & { details: KanjiDetails; onMnemonicSaved: () => void }) {
  const colors = useTheme();
  const answer = useCardAnswer(onGrade);

  // Reusing useCardAnswer: revealing counts as "answered" and stops the timer.
  return (
    <RevealCardFrame
      prompt={<Text style={[styles.bigKanji, { color: colors.text }]}>{details.char}</Text>}
      answer={<KanjiInfo details={details} onMnemonicSaved={onMnemonicSaved} isCompact />}
      isRevealed={answer.isCorrect !== null}
      onReveal={() => answer.recordAnswer(true)}
      showHardEasy={showHardEasy}
      onGrade={answer.grade}
    />
  );
}

const styles = StyleSheet.create({
  bigKanji: { fontSize: 120 },
});
