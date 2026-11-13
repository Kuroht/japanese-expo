import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AudioButton } from "@/shared/components/AudioButton";
import { JapaneseText } from "@/shared/components/JapaneseText";
import { NoJapaneseVoiceBanner } from "@/shared/components/NoJapaneseVoiceBanner";
import { useSpeech } from "@/shared/hooks/useSpeech";
import { useTheme } from "@/shared/hooks/useTheme";

import type { WordDetail } from "../types";
import { AddToStudyButton } from "./AddToStudyButton";
import { ExampleSentenceRow } from "./ExampleSentenceRow";
import { HeadwordKanjiLinks } from "./HeadwordKanjiLinks";
import { SenseList } from "./SenseList";
import { WordTags } from "./WordTags";

// A small titled block on the detail screen.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedText }]}>{title}</Text>
      {children}
    </View>
  );
}

// The loaded word: headword, audio, tags, other forms, meanings and examples.
export function WordDetailContent({ word }: { word: WordDetail }) {
  const colors = useTheme();
  const { speak, hasJapaneseVoice } = useSpeech();
  const headword = word.furigana.map((segment) => segment.text).join("");
  const showReading = headword !== word.kanaText;
  const otherForms = word.forms.map((form) => form.text).join("、 ");

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headRow}>
        <JapaneseText segments={word.furigana} fontSize={36} />
        <AudioButton label="Play reading" onPress={() => speak(word.kanaText)} size={28} />
      </View>
      {showReading ? (
        <Text style={[styles.reading, { color: colors.mutedText }]}>{word.kanaText}</Text>
      ) : null}
      <HeadwordKanjiLinks headword={headword} />
      <AddToStudyButton wordId={word.id} />
      <WordTags jlpt={word.jlpt} isCommon={word.isCommon} />
      {hasJapaneseVoice === false ? <NoJapaneseVoiceBanner /> : null}

      <Section title="Meanings">
        <SenseList senses={word.senses} />
      </Section>

      {word.forms.length > 1 ? (
        <Section title="Other forms">
          <Text style={[styles.forms, { color: colors.text }]}>{otherForms}</Text>
        </Section>
      ) : null}

      {word.sentences.length > 0 ? (
        <Section title="Examples">
          {word.sentences.map((sentence) => (
            <ExampleSentenceRow key={sentence.id} sentence={sentence} onPlay={speak} />
          ))}
        </Section>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reading: { fontSize: 18 },
  section: { gap: 8, marginTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase" },
  forms: { fontSize: 18 },
});
