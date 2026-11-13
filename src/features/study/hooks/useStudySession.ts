import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";

import { prepareSession } from "../api/prepareSession";
import { saveReview } from "../api/saveReview";
import { loadSettings } from "../api/studySettingsStore";
import { answerStep, finishIntro } from "../lib/sessionQueue";
import type { SessionStep, StudyRating } from "../types";

type SessionState = {
  status: "preparing" | "error" | "running";
  errorMessage: string | null;
  queue: SessionStep[];
  stepsDone: number;
  reviewsDone: number;
  newItemsDone: number;
  hadAnythingToStudy: boolean;
  showHardEasy: boolean;
};

const startState: SessionState = {
  status: "preparing",
  errorMessage: null,
  queue: [],
  stepsDone: 0,
  reviewsDone: 0,
  newItemsDone: 0,
  hadAnythingToStudy: false,
  showHardEasy: false,
};

// Owns the running session: the queue of steps and the counts for the end screen.
// Every answer is saved to the database straight away, so leaving early loses nothing.
export function useStudySession() {
  const db = useSQLiteContext();
  const [state, setState] = useState<SessionState>(startState);
  const hasStarted = useRef(false);
  // Blocks a second tap while an answer is being handled (a fast double tap would otherwise
  // save the same card twice and skip the next step). isSaving tells the screen to ignore taps.
  const isBusy = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  // Prepare once. prepareSession saves the new items, so running it twice (React dev
  // double-effects) would introduce extra items; the ref prevents that.
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    Promise.all([prepareSession(db, Date.now()), loadSettings(db)])
      .then(([{ queue }, settings]) =>
        setState({
          ...startState,
          status: "running",
          queue,
          hadAnythingToStudy: queue.length > 0,
          showHardEasy: settings.showHardEasy,
        }),
      )
      .catch((error: Error) =>
        setState({ ...startState, status: "error", errorMessage: error.message }),
      );
  }, [db]);

  // The queue changed (the step was handled and a new one is showing): accept taps again.
  useEffect(() => {
    isBusy.current = false;
  }, [state.queue]);

  // "Got it" on an intro. The busy flag is cleared by the effect above once the next step shows.
  const completeIntro = useCallback(() => {
    if (isBusy.current) return;
    isBusy.current = true;
    setState((current) => ({
      ...current,
      queue: finishIntro(current.queue),
      stepsDone: current.stepsDone + 1,
      newItemsDone: current.newItemsDone + 1,
    }));
  }, []);

  // Saves the rating for the first card, then moves on (Again re-inserts the card).
  const gradeCard = useCallback(
    async (rating: StudyRating, durationMs: number) => {
      const step = state.queue[0];
      if (!step || step.kind !== "card" || isBusy.current) return;
      isBusy.current = true;
      setIsSaving(true);
      try {
        const updatedCard = await saveReview(db, step.card, rating, Date.now(), durationMs);
        setState((current) => ({
          ...current,
          queue: answerStep(current.queue, rating, updatedCard),
          stepsDone: current.stepsDone + 1,
          reviewsDone: current.reviewsDone + 1,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        setState((current) => ({ ...current, status: "error", errorMessage: message }));
      } finally {
        isBusy.current = false;
        setIsSaving(false);
      }
    },
    [db, state.queue],
  );

  return { ...state, isSaving, completeIntro, gradeCard };
}
