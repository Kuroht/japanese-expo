import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { addWordToStudyQueue, isWordQueuedOrStudied, type WordStudyState } from "../api/studyQueue";

// A state that was read, remembered together with the word it belongs to.
type KnownState = { wordId: number; state: WordStudyState };

// Tracks where one word is in the user's study and lets them queue it.
// state is null while loading (or when the stored one is for another word);
// errorMessage is set if reading or saving failed.
export function useWordStudyState(wordId: number) {
  const db = useSQLiteContext();
  const [known, setKnown] = useState<KnownState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    isWordQueuedOrStudied(db, wordId)
      .then((state) => {
        if (isCurrent) setKnown({ wordId, state });
      })
      .catch((error: Error) => {
        if (isCurrent) setErrorMessage(error.message);
      });
    return () => {
      isCurrent = false;
    };
  }, [db, wordId]);

  const addToStudy = useCallback(() => {
    addWordToStudyQueue(db, wordId)
      .then(() => setKnown({ wordId, state: "queued" }))
      .catch((error: Error) => setErrorMessage(error.message));
  }, [db, wordId]);

  const state = known?.wordId === wordId ? known.state : null;
  return { state, errorMessage, addToStudy };
}
