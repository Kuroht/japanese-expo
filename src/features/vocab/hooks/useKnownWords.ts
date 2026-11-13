import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { listVocabWords } from "../api/listVocabWords";
import type { VocabListRow } from "../types";

const PAGE_SIZE = 100;

// The first page of one query, remembered with the query it was for.
type FirstPage = {
  queryKey: string;
  rows: VocabListRow[];
  errorMessage: string | null;
};

// Loads the word list one page at a time for the current level and search text.
// A change of level or search (or a reload after saving) starts again from the first page.
// "Loading" means the stored page belongs to an older query.
export function useKnownWords(jlpt: number, search: string) {
  const db = useSQLiteContext();
  const [reloadCount, setReloadCount] = useState(0);
  const [firstPage, setFirstPage] = useState<FirstPage | null>(null);
  const [extraRows, setExtraRows] = useState<{ queryKey: string; rows: VocabListRow[] }>({
    queryKey: "",
    rows: [],
  });
  const [hasMore, setHasMore] = useState(true);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const queryKey = `${jlpt}|${search}|${reloadCount}`;
  const isLoading = firstPage === null || firstPage.queryKey !== queryKey;

  useEffect(() => {
    let isCurrent = true;
    listVocabWords(db, { jlpt, search, offset: 0, limit: PAGE_SIZE })
      .then((rows) => {
        if (!isCurrent) return;
        setFirstPage({ queryKey, rows, errorMessage: null });
        setHasMore(rows.length === PAGE_SIZE);
        setLoadMoreError(null);
      })
      .catch((error: Error) => {
        if (isCurrent) setFirstPage({ queryKey, rows: [], errorMessage: error.message });
      });
    return () => {
      isCurrent = false;
    };
  }, [db, jlpt, search, queryKey]);

  // Pages after the first, kept only while they belong to the current query.
  const laterRows = extraRows.queryKey === queryKey ? extraRows.rows : [];
  const rows = isLoading ? [] : [...firstPage.rows, ...laterRows];

  // Next page, called when the list is scrolled near its end.
  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    try {
      const options = { jlpt, search, offset: rows.length, limit: PAGE_SIZE };
      const page = await listVocabWords(db, options);
      setExtraRows({ queryKey, rows: [...laterRows, ...page] });
      setHasMore(page.length === PAGE_SIZE);
    } catch (error) {
      setLoadMoreError((error as Error).message);
    }
  };

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const errorMessage = isLoading ? null : (firstPage.errorMessage ?? loadMoreError);

  return { rows, isLoading, errorMessage, loadMore, reload };
}
