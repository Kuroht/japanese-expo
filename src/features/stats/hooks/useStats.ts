import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import { getItemsByStage } from "../api/getItemsByStage";
import { getRetention } from "../api/getRetention";
import { getReviewsPerDay } from "../api/getReviewsPerDay";
import { getRecentTotals, getTotals } from "../api/getTotals";
import type { Stats } from "../types";

type StatsState = {
  isLoading: boolean;
  errorMessage: string | null;
  data: Stats | null;
};

// Loads every number on the Stats screen, and reloads each time the screen gains focus
// (so new reviews show up after coming back from a session). Old data stays visible while
// reloading, so the screen does not flash.
export function useStats(): StatsState {
  const db = useSQLiteContext();
  const [state, setState] = useState<StatsState>({
    isLoading: true,
    errorMessage: null,
    data: null,
  });

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;

      Promise.all([
        getReviewsPerDay(db),
        getRecentTotals(db),
        getRetention(db),
        getItemsByStage(db),
        getTotals(db),
      ])
        .then(([perDay, recentTotals, retention, itemsByStage, allTime]) => {
          const data = { perDay, recentTotals, retention, itemsByStage, allTime };
          if (isCurrent) setState({ isLoading: false, errorMessage: null, data });
        })
        .catch((error: Error) => {
          if (isCurrent) setState({ isLoading: false, errorMessage: error.message, data: null });
        });

      return () => {
        isCurrent = false;
      };
    }, [db]),
  );

  return state;
}
