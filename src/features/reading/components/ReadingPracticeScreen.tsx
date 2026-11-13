import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { usePracticeSentence } from "../hooks/usePracticeSentence";
import { usePracticeSentences } from "../hooks/usePracticeSentences";
import { useReadingSettings } from "../hooks/useReadingSettings";
import { SentenceCard } from "./SentenceCard";

// A centred message for the loading, error and empty states.
function Message({ text, isError }: { text: string; isError?: boolean }) {
  const colors = useTheme();
  return (
    <View style={styles.centered}>
      <Text style={[styles.message, { color: isError ? colors.danger : colors.mutedText }]}>
        {text}
      </Text>
    </View>
  );
}

// The Read tab. This component only decides between loading, error, empty and a sentence.
export function ReadingPracticeScreen() {
  const colors = useTheme();
  const list = usePracticeSentences();
  const sentenceLoad = usePracticeSentence(list.currentId);
  const { settings, errorMessage: settingsError, updateSettings } = useReadingSettings();

  const errorMessage = list.errorMessage ?? sentenceLoad.errorMessage ?? settingsError;
  if (errorMessage)
    return <Message isError text={`Could not load reading practice: ${errorMessage}`} />;
  if (list.isEmpty) {
    return (
      <Message text="Learn a few more words first — reading practice needs sentences made of words you know." />
    );
  }
  if (!settings || !sentenceLoad.sentence) {
    // Between sentences, loading shows a spinner; with no sentence at all, nothing to show yet.
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {list.hasRunOut ? (
        <Text style={[styles.banner, { color: colors.mutedText }]}>
          You have read every sentence available for now. Learn more words to unlock more.
        </Text>
      ) : null}
      <SentenceCard
        key={sentenceLoad.sentence.id}
        sentence={sentenceLoad.sentence}
        settings={settings}
        onRateChange={(shadowingRate) => updateSettings({ shadowingRate })}
        onNext={list.showNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  banner: { padding: 16, paddingBottom: 0, fontSize: 15, textAlign: "center" },
  message: { fontSize: 16, textAlign: "center" },
});
