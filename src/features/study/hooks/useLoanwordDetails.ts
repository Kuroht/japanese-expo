import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import { getLoanwordDetails, type LoanwordDetails } from "@/features/kana";

type DetailsState = {
  isLoading: boolean;
  errorMessage: string | null;
  details: LoanwordDetails | null;
};

// A finished load, remembered with the item key it was for.
type FinishedLoad = {
  itemKey: string;
  errorMessage: string | null;
  details: LoanwordDetails | null;
};

// Loads the word and meanings of a loanword item (its item_key is the word id).
// "Loading" means the stored result belongs to a different key (or there is none yet).
export function useLoanwordDetails(itemKey: string): DetailsState {
  const db = useSQLiteContext();
  const [finished, setFinished] = useState<FinishedLoad | null>(null);

  useEffect(() => {
    let isCurrent = true;
    getLoanwordDetails(db, Number(itemKey))
      .then((details) => {
        if (isCurrent) setFinished({ itemKey, errorMessage: null, details });
      })
      .catch((error: Error) => {
        if (isCurrent) setFinished({ itemKey, errorMessage: error.message, details: null });
      });
    return () => {
      isCurrent = false;
    };
  }, [db, itemKey]);

  if (finished === null || finished.itemKey !== itemKey) {
    return { isLoading: true, errorMessage: null, details: null };
  }
  return { isLoading: false, errorMessage: finished.errorMessage, details: finished.details };
}
