import { useCallback, useEffect, useRef, useState } from "react";
import { Rating } from "ts-fsrs";

import type { StudyRating } from "../types";

type OnGrade = (rating: StudyRating, durationMs: number) => void;

// Shared answer flow of every card: remember when the card appeared, record right/wrong,
// and send the final grade (with the time taken) to the session.
// Wrong answers are always Again. A correct answer is graded by the button the user taps.
export function useCardAnswer(onGrade: OnGrade) {
  const shownAt = useRef(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [durationMs, setDurationMs] = useState(0);

  // Start the timer when the card is shown (the card is re-created for every step).
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  // Called once, when the user submits or taps an answer.
  const recordAnswer = useCallback((correct: boolean) => {
    setDurationMs(Date.now() - shownAt.current);
    setIsCorrect(correct);
  }, []);

  // "I was right": flips a wrong answer (usually a typo) to correct.
  const markRight = useCallback(() => setIsCorrect(true), []);

  const grade = useCallback(
    (rating: StudyRating) => onGrade(rating, durationMs),
    [onGrade, durationMs],
  );
  // Wrong answers skip the grade buttons and go straight on as Again.
  const continueAfterWrong = useCallback(() => grade(Rating.Again), [grade]);

  return { isCorrect, recordAnswer, markRight, grade, continueAfterWrong };
}
