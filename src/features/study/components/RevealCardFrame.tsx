import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import type { StudyRating } from "../types";
import { CardLayout } from "./CardLayout";
import { GradeButtons } from "./GradeButtons";
import { StudyButton } from "./StudyButton";

// Frame of a self-graded card: the prompt, then "Show answer", then the answer and grade buttons.
type RevealCardFrameProps = {
  prompt: ReactNode;
  answer: ReactNode;
  isRevealed: boolean;
  onReveal: () => void;
  showHardEasy: boolean;
  onGrade: (rating: StudyRating) => void;
};

export function RevealCardFrame(props: RevealCardFrameProps) {
  return (
    <CardLayout>
      <View style={styles.prompt}>{props.prompt}</View>
      {props.isRevealed ? (
        <View style={styles.answer} accessibilityLiveRegion="polite">
          {props.answer}
          <GradeButtons showHardEasy={props.showHardEasy} onGrade={props.onGrade} isSelfGraded />
        </View>
      ) : (
        <StudyButton label="Show answer" onPress={props.onReveal} />
      )}
    </CardLayout>
  );
}

const styles = StyleSheet.create({
  prompt: { alignItems: "center", gap: 12 },
  answer: { gap: 16, alignItems: "center", alignSelf: "stretch" },
});
