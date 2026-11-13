import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import { searchWords } from "../api/searchWords";
import type { LoadState, WordSearchResult } from "../types";
import { useDebouncedValue } from "./useDebouncedValue";

const DEBOUNCE_MS = 250;

// A finished search, remembered together with the text it was for.
type FinishedSearch = {
  query: string;
  errorMessage: string | null;
  data: WordSearchResult[] | null;
};

// Searches the dictionary shortly after the user stops typing.
// Each result remembers its query: a slow older search can never replace a newer one,
// and "loading" simply means the stored result is for an older query.
export function useWordSearch(query: string): LoadState<WordSearchResult[]> {
  const db = useSQLiteContext();
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const [finished, setFinished] = useState<FinishedSearch | null>(null);

  useEffect(() => {
    let isCurrent = true;

    searchWords(db, debouncedQuery)
      .then((data) => {
        if (isCurrent) setFinished({ query: debouncedQuery, errorMessage: null, data });
      })
      .catch((error: Error) => {
        if (isCurrent) {
          setFinished({ query: debouncedQuery, errorMessage: error.message, data: null });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [db, debouncedQuery]);

  // While the debounce or the search is running, keep showing the last results.
  // Compare with the live query (not the debounced one), so we count as "loading"
  // during the debounce pause too, and never flash "No results" for old data.
  const isLoading = finished === null || finished.query !== query;
  return {
    isLoading,
    errorMessage: isLoading ? null : finished.errorMessage,
    data: finished?.data ?? null,
  };
}
