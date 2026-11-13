import { KanjiInfo, useKanjiDetails } from "@/features/kanji";

import { SessionMessage } from "./SessionMessage";

// Intro content for a new kanji: the character, meanings, readings, parts, mnemonic and strokes.
export function KanjiIntro({ itemKey }: { itemKey: string }) {
  const { isLoading, errorMessage, details, reload } = useKanjiDetails(itemKey);

  if (isLoading) return <SessionMessage isLoading message="Loading kanji…" />;
  if (errorMessage || !details) {
    return <SessionMessage isError message="Could not load this kanji." />;
  }
  return <KanjiInfo details={details} onMnemonicSaved={reload} />;
}
