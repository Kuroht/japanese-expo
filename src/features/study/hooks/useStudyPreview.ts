import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import { previewSession } from "../api/previewSession";
import type { SessionPlan } from "../types";

type PreviewState = { isLoading: boolean; errorMessage: string | null; plan: SessionPlan | null };

// Loads the session preview every time the home screen gains focus, so it is fresh after a
// session or after changing settings. The old preview stays visible while it refreshes.
export function useStudyPreview(): PreviewState {
  const db = useSQLiteContext();
  const [state, setState] = useState<PreviewState>({
    isLoading: true,
    errorMessage: null,
    plan: null,
  });

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;
      previewSession(db, Date.now())
        .then((plan) => {
          if (isCurrent) setState({ isLoading: false, errorMessage: null, plan });
        })
        .catch((error: Error) => {
          if (isCurrent) setState({ isLoading: false, errorMessage: error.message, plan: null });
        });
      return () => {
        isCurrent = false;
      };
    }, [db]),
  );

  return state;
}
