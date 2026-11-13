import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AudioButton } from "@/shared/components/AudioButton";
import { NoJapaneseVoiceBanner } from "@/shared/components/NoJapaneseVoiceBanner";
import { useSpeech } from "@/shared/hooks/useSpeech";
import { useTheme } from "@/shared/hooks/useTheme";

import { useLoanwordDetails } from "../hooks/useLoanwordDetails";
import { SessionMessage } from "./SessionMessage";

// Intro content for a new loanword: word, romaji, meanings, and audio that plays by itself once.
export function LoanwordIntro({ itemKey }: { itemKey: string }) {
  const colors = useTheme();
  const { speak, hasJapaneseVoice } = useSpeech();
  const { isLoading, errorMessage, details } = useLoanwordDetails(itemKey);
  const kanaText = details?.kanaText;

  // New vocabulary is always heard once when it first appears.
  useEffect(() => {
    if (kanaText) speak(kanaText);
  }, [kanaText, speak]);

  if (isLoading) return <SessionMessage isLoading message="Loading word…" />;
  if (errorMessage || !details) {
    return <SessionMessage isError message="Could not load this word." />;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.word, { color: colors.text }]}>{details.kanaText}</Text>
      <Text style={[styles.romaji, { color: colors.mutedText }]}>{details.romaji}</Text>
      <AudioButton label="Play pronunciation" size={32} onPress={() => speak(details.kanaText)} />
      <Text style={[styles.meanings, { color: colors.text }]}>{details.glosses.join("; ")}</Text>
      {hasJapaneseVoice === false ? <NoJapaneseVoiceBanner /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 8 },
  word: { fontSize: 52, textAlign: "center" },
  romaji: { fontSize: 24 },
  meanings: { fontSize: 20, textAlign: "center", marginTop: 8 },
});
