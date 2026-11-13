import { useEffect } from "react";

import { WordInfo } from "@/features/vocab";
import { NoJapaneseVoiceBanner } from "@/shared/components/NoJapaneseVoiceBanner";
import { useSpeech } from "@/shared/hooks/useSpeech";

import { useWordDetails } from "../hooks/useWordDetails";
import { SessionMessage } from "./SessionMessage";

// Intro content for a new word: headword, romaji, level, meanings and examples.
// The word is spoken once when it first appears.
export function WordIntro({ itemKey }: { itemKey: string }) {
  const { speak, hasJapaneseVoice } = useSpeech();
  const { isLoading, errorMessage, details } = useWordDetails(Number(itemKey));
  const kanaText = details?.kanaText;

  useEffect(() => {
    if (kanaText) speak(kanaText);
  }, [kanaText, speak]);

  if (isLoading) return <SessionMessage isLoading message="Loading word…" />;
  if (errorMessage || !details) {
    return <SessionMessage isError message="Could not load this word." />;
  }

  return (
    <>
      <WordInfo details={details} exampleCount={2} onPlay={speak} />
      {hasJapaneseVoice === false ? <NoJapaneseVoiceBanner /> : null}
    </>
  );
}
