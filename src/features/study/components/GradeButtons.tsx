import { StyleSheet, View } from "react-native";

import { Rating } from "ts-fsrs";

import type { StudyRating } from "../types";
import { StudyButton } from "./StudyButton";

// After a correct answer: a single "Next" (Good), or Hard / Good / Easy when the setting is on.
type GradeButtonsProps = {
  showHardEasy: boolean;
  onGrade: (rating: StudyRating) => void;
};

export function GradeButtons({ showHardEasy, onGrade }: GradeButtonsProps) {
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

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  cell: { flex: 1 },
});
