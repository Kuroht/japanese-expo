import type { SQLiteDatabase } from "expo-sqlite";

import { buildQueue, type NewItemWithCards } from "../lib/sessionQueue";
import type { SessionPlan, SessionStep } from "../types";
import { insertItemRows, loadItemCards } from "./introduceItem";
import { planSession } from "./planSession";

export type PreparedSession = { plan: SessionPlan; queue: SessionStep[] };

// The "Start session" button: plans the session, saves the fresh new items (so their cards
// have ids) and returns the ordered queue of steps to show.
// Planning reads the due cards BEFORE introducing, so new cards are never counted as reviews.
// All fresh items are introduced in ONE transaction: a crash never leaves half a session.
export async function prepareSession(db: SQLiteDatabase, now: number): Promise<PreparedSession> {
  const { plan, unseen, freshItems } = await planSession(db, now);

  await db.withTransactionAsync(async () => {
    for (const item of freshItems) {
      await insertItemRows(db, item, now);
    }
  });

  const fresh: NewItemWithCards[] = [];
  for (const item of freshItems) {
    fresh.push({ item, cards: await loadItemCards(db, item) });
  }
  // Unseen items go first, so they get the first intro spots.
  return { plan, queue: buildQueue(plan.reviews, [...unseen, ...fresh]) };
}
