import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { KanjiDetails } from "../types";
import { ComponentChips } from "./ComponentChips";
import { KanjiExampleWords } from "./KanjiExampleWords";
import { KanjiReadings } from "./KanjiReadings";
import { MnemonicEditor } from "./MnemonicEditor";
import { StrokeOrderAnimation } from "./StrokeOrderAnimation";

type KanjiInfoProps = {
  details: KanjiDetails;
  onMnemonicSaved: () => void;
  // Set on the detail screen so component chips can be tapped.
  onPressComponent?: (char: string) => void;
  // A card already shows the big kanji as its prompt, and skips the example words.
  isCompact?: boolean;
};

// A titled block of the kanji page.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedText }]}>{title}</Text>
      {children}
    </View>
  );
}

// Everything about one kanji: meanings, readings, parts, mnemonic, stroke order, example words.
export function KanjiInfo({
  details,
  onMnemonicSaved,
  onPressComponent,
  isCompact = false,
}: KanjiInfoProps) {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      {isCompact ? null : (
        <Text style={[styles.bigKanji, { color: colors.text }]}>{details.char}</Text>
      )}
      <Text style={[styles.meanings, { color: colors.text }]}>{details.meanings.join(", ")}</Text>
      <KanjiReadings onyomi={details.onyomi} kunyomi={details.kunyomi} />
      {details.components.length > 0 ? (
        <Section title="Parts">
          <ComponentChips components={details.components} onPressComponent={onPressComponent} />
        </Section>
      ) : null}
      <Section title="Mnemonic">
        <MnemonicEditor
          kanji={details.char}
          mnemonic={details.mnemonic}
          isEdited={details.isMnemonicEdited}
          onSaved={onMnemonicSaved}
        />
      </Section>
      <Section title="Stroke order">
        <StrokeOrderAnimation char={details.char} strokes={details.strokes} />
      </Section>
      {isCompact ? null : (
        <KanjiExampleWords words={details.exampleWords} areStudied={details.examplesAreStudied} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, alignItems: "center", alignSelf: "stretch" },
  bigKanji: { fontSize: 96 },
  meanings: { fontSize: 22, fontWeight: "600", textAlign: "center" },
  section: { gap: 8, alignSelf: "stretch", alignItems: "center" },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase" },
});
