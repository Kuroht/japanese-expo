import { StyleSheet, View } from "react-native";

import { AudioButton } from "@/shared/components/AudioButton";

import type { WordStudyDetails } from "../types";
import { WordExamples } from "./WordExamples";
import { WordHeadword } from "./WordHeadword";
import { WordMeanings } from "./WordMeanings";

// The full word block: headword with furigana, romaji, level, audio, meanings and examples.
// Used by the intro; cards that reveal pieces use the smaller parts directly.
type WordInfoProps = {
  details: WordStudyDetails;
  exampleCount: number;
  onPlay: (text: string) => void;
};

export function WordInfo({ details, exampleCount, onPlay }: WordInfoProps) {
  const examples = details.sentences.slice(0, exampleCount);

  return (
    <View style={styles.container}>
      <WordHeadword details={details} showRomaji showJlpt />
      <AudioButton label="Play pronunciation" size={32} onPress={() => onPlay(details.kanaText)} />
      <WordMeanings partsOfSpeech={details.partsOfSpeech} glosses={details.glosses} />
      {examples.length > 0 ? <WordExamples sentences={examples} onPlay={onPlay} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 12 },
});
