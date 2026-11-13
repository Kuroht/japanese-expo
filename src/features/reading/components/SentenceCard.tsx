import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AudioButton } from "@/shared/components/AudioButton";
import { NoJapaneseVoiceBanner } from "@/shared/components/NoJapaneseVoiceBanner";
import { useSpeech } from "@/shared/hooks/useSpeech";
import { useTheme } from "@/shared/hooks/useTheme";

import type { PracticeSentence, PracticeToken, ReadingSettings } from "../types";
import { ActionButton } from "./ActionButton";
import { SentenceView } from "./SentenceView";
import { ShadowingPanel } from "./ShadowingPanel";
import { WordPeek } from "./WordPeek";

type SentenceCardProps = {
  sentence: PracticeSentence;
  settings: ReadingSettings;
  onRateChange: (rate: number) => void;
  onNext: () => void;
};

// One sentence to read: the text, audio, translation, word panel and shadowing.
// The screen gives it a new key per sentence, so the reveal and peek state reset by themselves.
export function SentenceCard({ sentence, settings, onRateChange, onNext }: SentenceCardProps) {
  const colors = useTheme();
  const { speak, hasJapaneseVoice } = useSpeech();
  const [showTranslation, setShowTranslation] = useState(false);
  const [peekedToken, setPeekedToken] = useState<PracticeToken | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {hasJapaneseVoice === false ? <NoJapaneseVoiceBanner /> : null}
      <SentenceView
        tokens={sentence.tokens}
        furiganaMode={settings.furiganaMode}
        onTokenPress={setPeekedToken}
      />
      <View style={styles.buttonRow}>
        <AudioButton label="Play sentence" onPress={() => speak(sentence.japanese)} size={28} />
        <ActionButton
          label={showTranslation ? "Hide translation" : "Show translation"}
          onPress={() => setShowTranslation(!showTranslation)}
        />
      </View>
      {showTranslation ? (
        <Text style={[styles.translation, { color: colors.text }]}>{sentence.english}</Text>
      ) : null}
      <ShadowingPanel
        key={sentence.id}
        sentenceText={sentence.japanese}
        rate={settings.shadowingRate}
        onRateChange={onRateChange}
        speak={speak}
      />
      <ActionButton label="Next sentence" onPress={onNext} variant="primary" />
      <WordPeek
        token={peekedToken}
        onClose={() => setPeekedToken(null)}
        onSpeak={(text) => speak(text)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  translation: { fontSize: 18, lineHeight: 26 },
});
