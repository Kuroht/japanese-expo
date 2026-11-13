import { StyleSheet, View } from "react-native";

import { Rating } from "ts-fsrs";

import type { StudyRating } from "../types";
import { StudyButton } from "./StudyButton";

// After a correct answer: a single "Next" (Good), or Hard / Good / Easy when the setting is on.
// Self-graded cards (the user judges themself) also get "Again": Again / Good, or all four.
type GradeButtonsProps = {
  showHardEasy: boolean;
  onGrade: (rating: StudyRating) => void;
  isSelfGraded?: boolean;
};

export function GradeButtons({ showHardEasy, onGrade, isSelfGraded = false }: GradeButtonsProps) {
  if (isSelfGraded) return <SelfGradeButtons showHardEasy={showHardEasy} onGrade={onGrade} />;
  if (!showHardEasy) {
    return <StudyButton label="Next" onPress={() => onGrade(Rating.Good)} />;
  }
  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <StudyButton label="Hard" variant="secondary" onPress={() => onGrade(Rating.Hard)} />
      </View>
      <View style={styles.cell}>
        <StudyButton label="Good" onPress={() => onGrade(Rating.Good)} />
      </View>
      <View style={styles.cell}>
        <StudyButton label="Easy" variant="secondary" onPress={() => onGrade(Rating.Easy)} />
      </View>
    </View>
  );
}

// Two rows of two when all four ratings show, so the labels stay readable on a phone.
function SelfGradeButtons({ showHardEasy, onGrade }: Omit<GradeButtonsProps, "isSelfGraded">) {
  const again = (
    <StudyButton label="Again" variant="secondary" onPress={() => onGrade(Rating.Again)} />
  );
  const good = <StudyButton label="Good" onPress={() => onGrade(Rating.Good)} />;
  if (!showHardEasy) {
    return (
      <View style={styles.row}>
        <View style={styles.cell}>{again}</View>
        <View style={styles.cell}>{good}</View>
      </View>
    );
  }
  return (
    <View style={styles.rows}>
      <View style={styles.row}>
        <View style={styles.cell}>{again}</View>
        <View style={styles.cell}>
          <StudyButton label="Hard" variant="secondary" onPress={() => onGrade(Rating.Hard)} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.cell}>{good}</View>
        <View style={styles.cell}>
          <StudyButton label="Easy" variant="secondary" onPress={() => onGrade(Rating.Easy)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 8 },
  row: { flexDirection: "row", gap: 8 },
  cell: { flex: 1 },
});
