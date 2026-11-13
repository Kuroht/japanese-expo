import type { SQLiteDatabase } from "expo-sqlite";

import type { FuriganaMode, ReadingSettings } from "../types";

const SETTINGS_KEY = "reading";
const MIN_RATE = 0.5;
const MAX_RATE = 1.2;
const FURIGANA_MODES: FuriganaMode[] = ["always", "unlearned", "off"];

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  furiganaMode: "unlearned",
  shadowingRate: 0.9,
};

// Merges over the defaults and fixes bad values (hand-edited backup, old version),
// so the reader can never break on a weird setting.
function cleanSettings(saved: Partial<ReadingSettings>): ReadingSettings {
  const merged = { ...DEFAULT_READING_SETTINGS, ...saved };
  const furiganaMode = FURIGANA_MODES.includes(merged.furiganaMode)
    ? merged.furiganaMode
    : DEFAULT_READING_SETTINGS.furiganaMode;
  const rate = Number(merged.shadowingRate);
  const shadowingRate = Number.isFinite(rate)
    ? Math.min(MAX_RATE, Math.max(MIN_RATE, rate))
    : DEFAULT_READING_SETTINGS.shadowingRate;
  return { furiganaMode, shadowingRate };
}

// Reads the saved reading settings merged over the defaults. Broken JSON gives the defaults.
export async function loadReadingSettings(db: SQLiteDatabase): Promise<ReadingSettings> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    [SETTINGS_KEY],
  );
  if (!row) return DEFAULT_READING_SETTINGS;
  try {
    return cleanSettings(JSON.parse(row.value) as Partial<ReadingSettings>);
  } catch {
    return DEFAULT_READING_SETTINGS;
  }
}

// Saves only the changed settings; the others keep their current value.
export async function saveReadingSettings(
  db: SQLiteDatabase,
  changes: Partial<ReadingSettings>,
): Promise<ReadingSettings> {
  const merged = cleanSettings({ ...(await loadReadingSettings(db)), ...changes });
  await db.runAsync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [SETTINGS_KEY, JSON.stringify(merged)],
  );
  return merged;
}
