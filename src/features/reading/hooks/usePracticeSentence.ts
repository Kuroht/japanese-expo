import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import { getPracticeSentence } from "../api/getPracticeSentence";
import type { PracticeSentence } from "../types";

// A finished load, remembered together with the sentence id it was for.
type FinishedLoad = {
  id: number;
  errorMessage: string | null;
  sentence: PracticeSentence | null;
};

// Loads one sentence with its tokens. "Loading" means the stored result is for another id.
export function usePracticeSentence(id: number | null) {
  const db = useSQLiteContext();
  const [finished, setFinished] = useState<FinishedLoad | null>(null);

  useEffect(() => {
    if (id === null) return;
    let isCurrent = true;
    getPracticeSentence(db, id)
      .then((sentence) => {
        if (isCurrent) setFinished({ id, errorMessage: null, sentence });
      })
      .catch((error: Error) => {
        if (isCurrent) setFinished({ id, errorMessage: error.message, sentence: null });
      });
    return () => {
      isCurrent = false;
    };
  }, [db, id]);

  if (id === null) return { isLoading: false, errorMessage: null, sentence: null };
  if (finished === null || finished.id !== id) {
    return { isLoading: true, errorMessage: null, sentence: null };
  }
  return { isLoading: false, errorMessage: finished.errorMessage, sentence: finished.sentence };
}
