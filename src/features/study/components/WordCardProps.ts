import type { CardRow, StudyRating } from "../types";

// Props shared by the three word cards.
export type WordCardProps = {
  card: CardRow;
  showHardEasy: boolean;
  onGrade: (rating: StudyRating, durationMs: number) => void;
};
