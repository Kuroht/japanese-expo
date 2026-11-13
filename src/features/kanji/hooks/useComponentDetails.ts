import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import { getComponentDetails } from "../api/getComponentDetails";
import type { ComponentDetails } from "../types";

// A finished load, remembered with the character it was for.
type FinishedLoad = {
  char: string;
  errorMessage: string | null;
  details: ComponentDetails | null;
};

// Loads what a component card needs. "Loading" means the stored result is for another component.
export function useComponentDetails(char: string) {
  const db = useSQLiteContext();
  const [finished, setFinished] = useState<FinishedLoad | null>(null);

  useEffect(() => {
    let isCurrent = true;
    getComponentDetails(db, char)
      .then((details) => {
        if (isCurrent) setFinished({ char, errorMessage: null, details });
      })
      .catch((error: Error) => {
        if (isCurrent) setFinished({ char, errorMessage: error.message, details: null });
      });
    return () => {
      isCurrent = false;
    };
  }, [db, char]);

  if (finished === null || finished.char !== char) {
    return { isLoading: true, errorMessage: null, details: null };
  }
  return { isLoading: false, errorMessage: finished.errorMessage, details: finished.details };
}
