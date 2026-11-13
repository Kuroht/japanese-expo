import type { SQLiteDatabase } from "expo-sqlite";

import { DEFAULT_STUDY_SETTINGS } from "../lib/studySettings";
import type { StudySettings } from "../types";

const SETTINGS_KEY = "study";

// Reads the saved settings (JSON) merged over the defaults.
// Broken or missing JSON just gives the defaults, so a bad value can never block studying.
export async function loadSettings(db: SQLiteDatabase): Promise<StudySettings> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    [SETTINGS_KEY],
  );
  if (!row) return DEFAULT_STUDY_SETTINGS;
  try {
    const saved = JSON.parse(row.value) as Partial<StudySettings>;
    return { ...DEFAULT_STUDY_SETTINGS, ...saved };
  } catch {
    return DEFAULT_STUDY_SETTINGS;
  }
}

// Saves only the changed settings; the others keep their current value.
export async function saveSettings(
  db: SQLiteDatabase,
  changes: Partial<StudySettings>,
): Promise<StudySettings> {
  const merged = { ...(await loadSettings(db)), ...changes };
  await db.runAsync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [SETTINGS_KEY, JSON.stringify(merged)],
  );
  return merged;
}
