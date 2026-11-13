// KANJIDIC stores kun readings with a dot before the okurigana ("た.べる").
// We show it the way textbooks do: た(べる). A "-" prefix/suffix marks a bound form; drop it.
export function formatKunyomi(reading: string): string {
  const cleaned = reading.replace(/-/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex === -1) return cleaned;
  return `${cleaned.slice(0, dotIndex)}(${cleaned.slice(dotIndex + 1)})`;
}
