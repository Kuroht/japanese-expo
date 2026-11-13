import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import { getWordDetail } from "../api/getWordDetail";
import type { LoadState, WordDetail } from "../types";

// A finished load, remembered together with the word id it was for.
type FinishedLoad = {
  wordId: number;
  errorMessage: string | null;
  data: WordDetail | null;
};

// Loads one word for the detail screen. data stays null if the id was not found.
// "Loading" means the stored result is for a different word id (or nothing yet).
export function useWordDetail(wordId: number): LoadState<WordDetail> {
  const db = useSQLiteContext();
  const [finished, setFinished] = useState<FinishedLoad | null>(null);

  useEffect(() => {
    let isCurrent = true;

    getWordDetail(db, wordId)
      .then((data) => {
        if (isCurrent) setFinished({ wordId, errorMessage: null, data });
      })
      .catch((error: Error) => {
        if (isCurrent) setFinished({ wordId, errorMessage: error.message, data: null });
      });

    return () => {
      isCurrent = false;
    };
  }, [db, wordId]);

  if (finished === null || finished.wordId !== wordId) {
    return { isLoading: true, errorMessage: null, data: null };
  }
  return { isLoading: false, errorMessage: finished.errorMessage, data: finished.data };
}
