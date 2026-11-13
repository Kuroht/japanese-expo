import type { SQLiteDatabase } from "expo-sqlite";

import type { SessionPlan } from "../types";
import { planSession } from "./planSession";

// What a session would contain right now, for the home screen. Unlike prepareSession this is
// read-only: it never introduces anything, so looking at the home screen changes nothing.
export async function previewSession(db: SQLiteDatabase, now: number): Promise<SessionPlan> {
  const { plan } = await planSession(db, now);
  return plan;
}
