import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";

import { findPracticeSentences } from "../api/findPracticeSentences";

const BATCH_SIZE = 10;

// Hands out practice sentence ids one at a time. It loads a batch of about 10, and when the
// batch runs out it loads more, skipping the ones already shown.
// currentId is null while loading, and when the user knows too few words (isEmpty).
// hasRunOut means every sentence was shown; the last one stays on screen.
export function usePracticeSentences() {
  const db = useSQLiteContext();
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [hasRunOut, setHasRunOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Refs: these change often but never need to redraw the screen by themselves.
  const waitingIds = useRef<number[]>([]);
  const seenIds = useRef<number[]>([]);

  // Takes the next waiting id, loading a new batch first when none are waiting.
  // Returns null when there is nothing new to show.
  const fetchNextId = useCallback(async (): Promise<number | null> => {
    if (waitingIds.current.length === 0) {
      const found = await findPracticeSentences(db, {
        limit: BATCH_SIZE,
        excludeIds: seenIds.current,
      });
      waitingIds.current = found.map((sentence) => sentence.id);
    }
    return waitingIds.current.shift() ?? null;
  }, [db]);

  // Applies the result of fetchNextId to the screen state.
  const showResult = useCallback((pending: Promise<number | null>) => {
    pending
      .then((nextId) => {
        if (nextId === null) {
          // Nothing new: with nothing seen yet the user lacks words; otherwise they read them all.
          setIsEmpty(seenIds.current.length === 0);
          setHasRunOut(seenIds.current.length > 0);
          return;
        }
        seenIds.current.push(nextId);
        setCurrentId(nextId);
      })
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    showResult(fetchNextId());
  }, [fetchNextId, showResult]);

  const showNext = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
    showResult(fetchNextId());
  }, [fetchNextId, showResult]);

  return { currentId, isLoading, isEmpty, hasRunOut, errorMessage, showNext };
}
