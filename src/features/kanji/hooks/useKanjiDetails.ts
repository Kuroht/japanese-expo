import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { getKanjiDetails } from "../api/getKanjiDetails";
import type { KanjiDetails } from "../types";

// A finished load, remembered with the character it was for.
type FinishedLoad = {
  char: string;
  errorMessage: string | null;
  details: KanjiDetails | null;
};

// Loads everything a kanji card needs. "Loading" means the stored result is for another kanji.
// reload() fetches again (used after the user saves a mnemonic).
export function useKanjiDetails(char: string) {
  const db = useSQLiteContext();
  const [finished, setFinished] = useState<FinishedLoad | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    getKanjiDetails(db, char)
      .then((details) => {
        if (isCurrent) setFinished({ char, errorMessage: null, details });
      })
      .catch((error: Error) => {
        if (isCurrent) setFinished({ char, errorMessage: error.message, details: null });
      });
    return () => {
      isCurrent = false;
    };
  }, [db, char, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  if (finished === null || finished.char !== char) {
    return { isLoading: true, errorMessage: null, details: null, reload };
  }
  return {
    isLoading: false,
    errorMessage: finished.errorMessage,
    details: finished.details,
    reload,
  };
}
