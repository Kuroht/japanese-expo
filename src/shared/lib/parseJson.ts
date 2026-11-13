import type { FuriganaSegment } from "@/shared/db/types";

// Reads a JSON column that should hold a list of strings. Bad data gives [].
export function parseStringList(json: string | null): string[] {
  if (!json) return [];
  try {
    const value: unknown = JSON.parse(json);
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

// Reads a furigana JSON column. If it is missing or broken we show the plain text.
export function parseFurigana(json: string | null, fallbackText: string): FuriganaSegment[] {
  const fallback = [{ text: fallbackText }];
  if (!json) return fallback;
  try {
    const value: unknown = JSON.parse(json);
    if (!Array.isArray(value) || value.length === 0) return fallback;
    // Every segment needs a text string, or JapaneseText would crash.
    const isValid = value.every((segment) => typeof segment?.text === "string");
    if (!isValid) return fallback;
    return value as FuriganaSegment[];
  } catch {
    return fallback;
  }
}
