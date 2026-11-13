import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { loadReadingSettings, saveReadingSettings } from "../api/readingSettingsStore";
import type { ReadingSettings } from "../types";

// Loads the reading settings and saves every change straight away.
// settings stays null while loading (or if loading failed, see errorMessage).
export function useReadingSettings() {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<ReadingSettings | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadReadingSettings(db)
      .then(setSettings)
      .catch((error: Error) => setErrorMessage(error.message));
  }, [db]);

  const updateSettings = useCallback(
    (changes: Partial<ReadingSettings>) => {
      saveReadingSettings(db, changes)
        .then(setSettings)
        .catch((error: Error) => setErrorMessage(error.message));
    },
    [db],
  );

  return { settings, errorMessage, updateSettings };
}
