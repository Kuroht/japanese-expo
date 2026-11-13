import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { loadSettings, saveSettings, type StudySettings } from "@/features/study";

// Loads the study settings and saves every change straight away.
// settings stays null while loading (or if loading failed, see errorMessage).
export function useStudySettings() {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<StudySettings | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings(db)
      .then(setSettings)
      .catch((error: Error) => setErrorMessage(error.message));
  }, [db]);

  const updateSettings = useCallback(
    (changes: Partial<StudySettings>) => {
      saveSettings(db, changes)
        .then(setSettings)
        .catch((error: Error) => setErrorMessage(error.message));
    },
    [db],
  );

  return { settings, errorMessage, updateSettings };
}
