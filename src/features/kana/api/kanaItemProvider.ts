import type { SQLiteDatabase } from "expo-sqlite";

import { pickCandidates } from "../lib/pickCandidates";
import type { KanaItemRef } from "../types";
import { loadLoanwordIds } from "./loanwords";

// The new-item provider for kana and loanwords (the study engine asks it for new items).
export async function kanaItemProvider(
  db: SQLiteDatabase,
  isIntroduced: (itemType: string, itemKey: string) => boolean,
  limit: number,
): Promise<KanaItemRef[]> {
  const loanwordIds = await loadLoanwordIds(db, limit);
  return pickCandidates({ isIntroduced, loanwordIds, limit });
}
