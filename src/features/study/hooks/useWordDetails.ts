import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import { getWordStudyDetails, type WordStudyDetails } from "@/features/vocab";

type DetailsState = {
  isLoading: boolean;
  errorMessage: string | null;
  details: WordStudyDetails | null;
};

// A finished load, remembered with the word id it was for.
type FinishedLoad = {
  wordId: number;
  errorMessage: string | null;
  details: WordStudyDetails | null;
};

// Loads everything a word card needs. "Loading" means the stored result is for another word.
export function useWordDetails(wordId: number): DetailsState {
  const db = useSQLiteContext();
  const [finished, setFinished] = useState<FinishedLoad | null>(null);

  useEffect(() => {
    let isCurrent = true;
    getWordStudyDetails(db, wordId)
      .then((details) => {
        if (isCurrent) setFinished({ wordId, errorMessage: null, details });
      })
      .catch((error: Error) => {
        if (isCurrent) setFinished({ wordId, errorMessage: error.message, details: null });
      });
    return () => {
      isCurrent = false;
    };
  }, [db, wordId]);

  if (finished === null || finished.wordId !== wordId) {
    return { isLoading: true, errorMessage: null, details: null };
  }
  return { isLoading: false, errorMessage: finished.errorMessage, details: finished.details };
}
