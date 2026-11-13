import * as Speech from "expo-speech";
import { useCallback, useEffect, useState } from "react";

// onDone runs when the voice finishes (not when it is stopped early).
type SpeakOptions = { rate?: number; onDone?: () => void };

// Speaks Japanese text aloud and reports whether a Japanese voice is installed.
// hasJapaneseVoice is null while we are still checking.
export function useSpeech() {
  const [hasJapaneseVoice, setHasJapaneseVoice] = useState<boolean | null>(null);

  // Ask the text-to-speech engine which voices it has, once.
  useEffect(() => {
    let isActive = true;
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const found = voices.some((voice) => voice.language.toLowerCase().startsWith("ja"));
        if (isActive) setHasJapaneseVoice(found);
      })
      .catch(() => {
        if (isActive) setHasJapaneseVoice(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  // Stops anything already playing so taps never queue up.
  const speak = useCallback((text: string, options: SpeakOptions = {}) => {
    Speech.stop();
    Speech.speak(text, { language: "ja-JP", rate: options.rate ?? 1.0, onDone: options.onDone });
  }, []);

  return { speak, hasJapaneseVoice };
}
